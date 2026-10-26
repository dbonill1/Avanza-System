import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Database } from "@/types/base-datos";

import { decidirDosPasos, rutaPendiente, type EstadoDosPasos } from "./dos-pasos";
import type { Rol } from "./roles";

export type UsuarioActual = {
  id: string;
  nombre: string;
  rol: Rol;
  tiendas: { id: string; nombre: string }[];
  dosPasos: EstadoDosPasos;
};

// Lee el usuario con el cliente que se le pase. RLS decide qué vuelve: un
// usuario desactivado no ve ni su propia fila, así que aquí da null.
// nivelSesion es el "aal" del token: aal1 = solo contraseña, aal2 = con 2FA.
export async function leerUsuario(
  supabase: SupabaseClient<Database>,
  id: string,
  nivelSesion: string | undefined,
): Promise<UsuarioActual | null> {
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("id, nombre, rol")
    .eq("id", id)
    .maybeSingle();
  if (!usuario) return null;

  // Solo para Admin sin código todavía: ¿ya configuró su app autenticadora?
  let tieneFactor = false;
  if (usuario.rol === "admin" && nivelSesion !== "aal2") {
    const { data: factores } = await supabase.auth.mfa.listFactors();
    tieneFactor = (factores?.totp.length ?? 0) > 0;
  }
  const dosPasos = decidirDosPasos(usuario.rol, nivelSesion, tieneFactor);

  // RLS ya filtra: cada quien ve sus tiendas asignadas; Admin, todas
  // (y ninguna si todavía no puso el código).
  const { data: tiendas } = await supabase
    .from("tiendas")
    .select("id, nombre")
    .eq("activa", true)
    .order("nombre");

  return { ...usuario, tiendas: tiendas ?? [], dosPasos };
}

// Para Server Actions: lee la sesión del cliente que se le pase.
export async function cargarUsuario(
  supabase: SupabaseClient<Database>,
): Promise<UsuarioActual | null> {
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return leerUsuario(supabase, claims.sub, claims.aal);
}

// Sin caché entre requests a propósito: si Admin desactiva a alguien o le
// cambia el rol, aplica en el siguiente request. cache() solo evita repetir
// la consulta dentro del mismo request.
export const obtenerUsuarioActual = cache(
  async (): Promise<UsuarioActual | null> => {
    // La sesión siempre se lee en el request: Supabase compara la expiración
    // del token con la hora actual, y eso no se puede prerenderizar.
    await connection();
    return cargarUsuario(await crearClienteServidor());
  },
);

// Para las páginas de la app: sin sesión, usuario inactivo o Admin sin
// código → fuera, antes de renderizar nada.
export async function requerirUsuario(): Promise<UsuarioActual> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/iniciar-sesion");
  const pendiente = rutaPendiente(usuario.dosPasos);
  if (pendiente) redirect(pendiente);
  return usuario;
}
