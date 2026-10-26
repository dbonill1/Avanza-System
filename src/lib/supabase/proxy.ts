import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { envPublico } from "@/lib/env/publico";

// Refresca la sesión de Supabase en cada request y devuelve la respuesta con
// las cookies actualizadas. No decide permisos: eso lo hace RLS.
export async function actualizarSesion(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    envPublico.NEXT_PUBLIC_SUPABASE_URL,
    envPublico.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesPorPoner, encabezados) {
          for (const { name, value } of cookiesPorPoner) {
            request.cookies.set(name, value);
          }
          respuesta = NextResponse.next({ request });
          for (const { name, value, options } of cookiesPorPoner) {
            respuesta.cookies.set(name, value, options);
          }
          // Cache-Control: no-store, para que un CDN nunca sirva la sesión
          // de un usuario a otro.
          for (const [clave, valor] of Object.entries(encabezados)) {
            respuesta.headers.set(clave, valor);
          }
        },
      },
    },
  );

  // No poner código entre createServerClient y getClaims: getClaims es lo que
  // valida el token y dispara el refresco si venció.
  await supabase.auth.getClaims();

  return respuesta;
}
