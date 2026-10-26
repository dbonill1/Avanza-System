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
  const { data } = await supabase.auth.getClaims();

  // Chequeo rápido: sin sesión, al login. El chequeo real (usuario activo,
  // rol) lo hacen el layout de (app) y RLS; esto solo evita renderizar de más.
  const ruta = request.nextUrl.pathname;
  const esPublica = RUTAS_PUBLICAS.some((r) => ruta === r || ruta.startsWith(`${r}/`));
  if (!data?.claims && !esPublica) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/iniciar-sesion";
    destino.search = "";
    const redireccion = NextResponse.redirect(destino);
    // Conserva las cookies que getClaims haya actualizado (p. ej. al borrar
    // una sesión vencida) y los encabezados no-store.
    for (const cookie of respuesta.cookies.getAll()) {
      redireccion.cookies.set(cookie);
    }
    respuesta.headers.forEach((valor, clave) => {
      if (clave.toLowerCase() !== "location") redireccion.headers.set(clave, valor);
    });
    return redireccion;
  }

  return respuesta;
}

const RUTAS_PUBLICAS = ["/iniciar-sesion"];
