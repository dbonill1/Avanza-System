import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Database } from "@/types/base-datos";

export type Rol = Database["public"]["Enums"]["rol_usuario"];

export type UsuarioActual = {
  id: string;
  nombre: string;
  rol: Rol;
  tiendas: { id: string; nombre: string }[];
};

// Lee el usuario con el cliente que se le pase. RLS decide qué vuelve: un
// usuario desactivado no ve ni su propia fila, así que aquí da null.
export async function leerUsuario(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<UsuarioActual | null> {
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("id, nombre, rol")
    .eq("id", id)
    .maybeSingle();
  if (!usuario) return null;

  // RLS ya filtra: cada quien ve sus tiendas asignadas; Admin, todas.
  const { data: tiendas } = await supabase
    .from("tiendas")
    .select("id, nombre")
    .eq("activa", true)
    .order("nombre");

  return { ...usuario, tiendas: tiendas ?? [] };
}

// Sin caché entre requests a propósito: si Admin desactiva a alguien o le
// cambia el rol, aplica en el siguiente request. cache() solo evita repetir
// la consulta dentro del mismo request.
export const obtenerUsuarioActual = cache(
  async (): Promise<UsuarioActual | null> => {
    // La sesión siempre se lee en el request: Supabase compara la expiración
    // del token con la hora actual, y eso no se puede prerenderizar.
    await connection();
    const supabase = await crearClienteServidor();
    const { data } = await supabase.auth.getClaims();
    const id = data?.claims.sub;
    if (!id) return null;
    return leerUsuario(supabase, id);
  },
);

export async function requerirUsuario(): Promise<UsuarioActual> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/iniciar-sesion");
  return usuario;
}

export const ETIQUETA_ROL: Record<Rol, string> = {
  vendedor: "Vendedor",
  cajero: "Cajero",
  bodega: "Bodega",
  gerente: "Gerente",
  admin: "Administrador",
};
