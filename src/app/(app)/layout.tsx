import { Suspense } from "react";

import { requerirUsuario } from "@/lib/auth/usuario-actual";

import { MenuLateral } from "./menu-lateral";

// Todo lo que está dentro de (app) exige sesión y usuario activo.
// Con cacheComponents, leer la sesión tiene que ir dentro de <Suspense>.
export default function LayoutApp({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<Cargando />}>
      <ConSesion>{children}</ConSesion>
    </Suspense>
  );
}

async function ConSesion({ children }: { children: React.ReactNode }) {
  // Si no hay sesión o el usuario está desactivado, redirige al login
  // antes de renderizar nada de la página.
  const usuario = await requerirUsuario();
  return (
    <div className="flex min-h-screen flex-wrap">
      <MenuLateral usuario={usuario} />
      <main className="flex min-w-0 flex-[999_1_600px] flex-col">{children}</main>
    </div>
  );
}

function Cargando() {
  return (
    <div className="flex min-h-screen items-center justify-center text-tenue" role="status">
      Cargando…
    </div>
  );
}
