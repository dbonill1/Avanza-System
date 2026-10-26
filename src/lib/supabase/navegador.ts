import { createBrowserClient } from "@supabase/ssr";

import { envPublico } from "@/lib/env/publico";
import type { Database } from "@/types/base-datos";

// Cliente para Client Components. Solo usa la publishable key: todo lo que
// puede hacer lo decide RLS en la base de datos.
export function crearClienteNavegador() {
  return createBrowserClient<Database>(
    envPublico.NEXT_PUBLIC_SUPABASE_URL,
    envPublico.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
