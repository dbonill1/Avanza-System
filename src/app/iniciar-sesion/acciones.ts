"use server";

import { redirect } from "next/navigation";

import {
  esquemaLogin,
  MENSAJE_CREDENCIALES,
  MENSAJE_DEMASIADOS_INTENTOS,
  MENSAJE_INACTIVO,
  type EstadoLogin,
} from "@/lib/auth/esquemas";
import { leerUsuario } from "@/lib/auth/usuario-actual";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export async function iniciarSesion(
  _estadoAnterior: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const correoEscrito = String(formData.get("correo") ?? "");
  const datos = esquemaLogin.safeParse({
    correo: formData.get("correo"),
    clave: formData.get("clave"),
  });
  if (!datos.success) {
    return {
      error: datos.error.issues[0]?.message ?? "Revisa los datos.",
      correo: correoEscrito,
    };
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: datos.data.correo,
    password: datos.data.clave,
  });
  if (error || !data.user) {
    return {
      error: error?.status === 429 ? MENSAJE_DEMASIADOS_INTENTOS : MENSAJE_CREDENCIALES,
      correo: correoEscrito,
    };
  }

  // La contraseña es correcta, pero solo entra quien tiene usuario activo en
  // la app (Auth no sabe nada de usuarios.activo).
  const usuario = await leerUsuario(supabase, data.user.id);
  if (!usuario) {
    await supabase.auth.signOut();
    return { error: MENSAJE_INACTIVO, correo: correoEscrito };
  }

  redirect("/");
}
