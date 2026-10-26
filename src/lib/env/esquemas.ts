import { z } from "zod";

// Prefijo de las secret keys de Supabase. Una key con este prefijo
// nunca debe terminar en una variable NEXT_PUBLIC_ (llegaría al navegador).
const PREFIJO_SECRET_KEY = "sb_secret_";

const esquemaEnvPublico = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1)
    .refine((key) => !key.startsWith(PREFIJO_SECRET_KEY), {
      message:
        "Es una secret key: nunca debe ir en una variable NEXT_PUBLIC_. Usa la publishable key.",
    }),
});

const esquemaEnvServidor = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1),
});

export type EnvPublico = z.infer<typeof esquemaEnvPublico>;
export type EnvServidor = z.infer<typeof esquemaEnvServidor>;

type Fuente = Record<string, string | undefined>;

function parsear<T extends z.ZodType>(
  esquema: T,
  fuente: Fuente,
  nombre: string,
): z.infer<T> {
  const resultado = esquema.safeParse(fuente);
  if (!resultado.success) {
    // prettifyError muestra nombres de variables y mensajes, no los valores.
    throw new Error(
      `Variables de entorno ${nombre} inválidas:\n${z.prettifyError(resultado.error)}`,
    );
  }
  return resultado.data;
}

export function parsearEnvPublico(fuente: Fuente): EnvPublico {
  return parsear(esquemaEnvPublico, fuente, "públicas");
}

export function parsearEnvServidor(fuente: Fuente): EnvServidor {
  return parsear(esquemaEnvServidor, fuente, "del servidor");
}
