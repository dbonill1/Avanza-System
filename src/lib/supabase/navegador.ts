import { createBrowserClient } from "@supabase/ssr";

import { envPublico } from "@/lib/env/publico";

// Cliente para Client Components. Solo usa la publishable key: todo lo que
// puede hacer lo decide RLS en la base de datos.
export function crearClienteNavegador() {
  return createBrowserClient(
    envPublico.NEXT_PUBLIC_SUPABASE_URL,
    envPublico.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
