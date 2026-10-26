import { z } from "zod";

export const esquemaLogin = z.object({
  correo: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: "Escribe un correo válido." })),
  clave: z
    .string()
    .min(1, { message: "Escribe tu contraseña." })
    .max(200, { message: "La contraseña es demasiado larga." }),
});

export type DatosLogin = z.infer<typeof esquemaLogin>;

export type EstadoLogin = {
  error: string | null;
  // Se devuelve para no borrar lo que escribió el usuario si hay error.
  correo: string;
};

// Mismo mensaje para correo inexistente y contraseña equivocada: así no se
// puede averiguar qué correos tienen cuenta.
export const MENSAJE_CREDENCIALES = "Correo o contraseña incorrectos.";
export const MENSAJE_DEMASIADOS_INTENTOS =
  "Demasiados intentos. Espera unos minutos y vuelve a intentar.";
export const MENSAJE_INACTIVO =
  "Tu cuenta está desactivada. Habla con el administrador.";
