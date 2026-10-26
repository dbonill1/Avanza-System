"use server";

import { redirect } from "next/navigation";

import { MENSAJE_DEMASIADOS_INTENTOS } from "@/lib/auth/esquemas";
import {
  esquemaCodigo,
  MENSAJE_CODIGO_INCORRECTO,
  type EstadoCodigo,
} from "@/lib/auth/dos-pasos";
import { cargarUsuario } from "@/lib/auth/usuario-actual";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export async function verificarCodigo(
  _estadoAnterior: EstadoCodigo,
  formData: FormData,
): Promise<EstadoCodigo> {
  const codigo = esquemaCodigo.safeParse(formData.get("codigo"));
  if (!codigo.success) {
    return { error: codigo.error.issues[0]?.message ?? "Revisa el código." };
  }

  const supabase = await crearClienteServidor();
  const usuario = await cargarUsuario(supabase);
  if (!usuario) redirect("/iniciar-sesion");
  if (usuario.dosPasos !== "verificar") redirect("/");

  // El factor se toma de la cuenta de la sesión, nunca del formulario.
  const { data: factores } = await supabase.auth.mfa.listFactors();
  const factor = factores?.totp[0];
  if (!factor) redirect("/configurar-2fa");

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: factor.id,
    code: codigo.data,
  });
  if (error) {
    return { error: error.status === 429 ? MENSAJE_DEMASIADOS_INTENTOS : MENSAJE_CODIGO_INCORRECTO };
  }

  redirect("/");
}
