import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { envPublico } from "@/lib/env/publico";

// Cliente para Server Components, Server Actions y Route Handlers.
// Actúa como el usuario de la sesión (sus cookies), así que RLS aplica.
// Se crea uno nuevo por request.
export async function crearClienteServidor() {
  const almacenCookies = await cookies();

  return createServerClient(
    envPublico.NEXT_PUBLIC_SUPABASE_URL,
    envPublico.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return almacenCookies.getAll();
        },
        setAll(cookiesPorPoner) {
          try {
            for (const { name, value, options } of cookiesPorPoner) {
              almacenCookies.set(name, value, options);
            }
          } catch {
            // Los Server Components no pueden escribir cookies. No pasa nada:
            // el proxy (src/proxy.ts) ya refrescó la sesión en este request.
          }
        },
      },
    },
  );
}
