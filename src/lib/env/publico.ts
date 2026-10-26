import { parsearEnvPublico } from "./esquemas";

// Next.js solo incrusta las variables NEXT_PUBLIC_ en el navegador cuando se
// leen de forma literal (process.env.NOMBRE), por eso no se pasa process.env entero.
export const envPublico = parsearEnvPublico({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
