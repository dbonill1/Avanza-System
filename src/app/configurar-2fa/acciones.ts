"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { MENSAJE_DEMASIADOS_INTENTOS } from "@/lib/auth/esquemas";
import {
  esquemaCodigo,
  MENSAJE_CODIGO_INCORRECTO,
  type EstadoCodigo,
} from "@/lib/auth/dos-pasos";
import { cargarUsuario } from "@/lib/auth/usuario-actual";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export type NuevoFactor =
  | { ok: true; factorId: string; qr: string; secreto: string }
  | { ok: false; error: string };

// Crea el factor TOTP y devuelve el QR para escanearlo. Antes borra los
// factores que se empezaron y nunca se confirmaron (p. ej. si recargó la página).
export async function prepararFactor(): Promise<NuevoFactor> {
  const supabase = await crearClienteServidor();
  const usuario = await cargarUsuario(supabase);
  if (!usuario) redirect("/iniciar-sesion");
  if (usuario.dosPasos !== "configurar") redirect("/");

  const { data: factores } = await supabase.auth.mfa.listFactors();
  for (const f of factores?.all ?? []) {
    if (f.factor_type === "totp" && f.status === "unverified") {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Sistema Avanza",
    issuer: "Avanza Autopartes",
  });
  if (error || !data) {
    return { ok: false, error: "No se pudo generar el código QR. Recarga la página." };
  }
  return { ok: true, factorId: data.id, qr: data.totp.qr_code, secreto: data.totp.secret };
}

export async function confirmarFactor(
  _estadoAnterior: EstadoCodigo,
  formData: FormData,
): Promise<EstadoCodigo> {
  const codigo = esquemaCodigo.safeParse(formData.get("codigo"));
  if (!codigo.success) {
    return { error: codigo.error.issues[0]?.message ?? "Revisa el código." };
  }
  const factorId = z.uuid().safeParse(formData.get("factorId"));
  if (!factorId.success) return { error: "Recarga la página e inténtalo de nuevo." };

  const supabase = await crearClienteServidor();
  const usuario = await cargarUsuario(supabase);
  if (!usuario) redirect("/iniciar-sesion");
  if (usuario.dosPasos !== "configurar") redirect("/");

  // El factor tiene que ser de esta cuenta y estar sin confirmar.
  const { data: factores } = await supabase.auth.mfa.listFactors();
  const propio = factores?.all.some(
    (f) => f.id === factorId.data && f.factor_type === "totp" && f.status === "unverified",
  );
  if (!propio) return { error: "Recarga la página e inténtalo de nuevo." };

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: factorId.data,
    code: codigo.data,
  });
  if (error) {
    return { error: error.status === 429 ? MENSAJE_DEMASIADOS_INTENTOS : MENSAJE_CODIGO_INCORRECTO };
  }

  redirect("/");
}
