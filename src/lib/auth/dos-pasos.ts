import { z } from "zod";

import type { Rol } from "./roles";

// Qué le falta a la sesión para entrar a la app:
//   no-requerido: el rol no exige 2FA
//   listo:        Admin ya puso el código en esta sesión (aal2)
//   verificar:    Admin con 2FA configurada; falta el código de hoy
//   configurar:   Admin que todavía no configuró su app autenticadora
export type EstadoDosPasos = "no-requerido" | "listo" | "verificar" | "configurar";

export function decidirDosPasos(
  rol: Rol,
  nivelSesion: string | undefined,
  tieneFactorVerificado: boolean,
): EstadoDosPasos {
  if (rol !== "admin") return "no-requerido";
  if (nivelSesion === "aal2") return "listo";
  return tieneFactorVerificado ? "verificar" : "configurar";
}

export const RUTA_DOS_PASOS = {
  verificar: "/verificar-2fa",
  configurar: "/configurar-2fa",
} as const;

export function rutaPendiente(estado: EstadoDosPasos): string | null {
  return estado === "verificar" || estado === "configurar" ? RUTA_DOS_PASOS[estado] : null;
}

// Las apps muestran el código como "123 456": se aceptan espacios.
export const esquemaCodigo = z
  .string({ message: "Escribe el código de 6 dígitos." })
  .transform((codigo) => codigo.replace(/\s+/g, ""))
  .pipe(z.string().regex(/^\d{6}$/, { message: "El código tiene 6 dígitos." }));

export type EstadoCodigo = { error: string | null };

export const MENSAJE_CODIGO_INCORRECTO =
  "El código no es correcto o ya cambió. Escribe el que muestra ahora tu app.";
