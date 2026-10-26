import "server-only";

import { parsearEnvServidor } from "./esquemas";

export const envServidor = parsearEnvServidor({
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
});
