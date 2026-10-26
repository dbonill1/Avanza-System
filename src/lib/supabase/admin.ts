import "server-only";

import { createClient } from "@supabase/supabase-js";

import { envPublico } from "@/lib/env/publico";
import { envServidor } from "@/lib/env/servidor";
import type { Database } from "@/types/base-datos";

// Cliente con la secret key: SE SALTA RLS. Solo para tareas de Admin que
// RLS no puede cubrir (crear usuarios en Auth). Antes de usarlo, el código
// que lo llama debe verificar que la sesión actual es de un Admin.
export function crearClienteAdmin() {
  return createClient<Database>(
    envPublico.NEXT_PUBLIC_SUPABASE_URL,
    envServidor.SUPABASE_SECRET_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
