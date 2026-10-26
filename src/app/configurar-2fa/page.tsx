import type { Metadata } from "next";
import { Suspense } from "react";

import { PantallaAcceso } from "@/components/pantalla-acceso";
import { cerrarSesion } from "@/lib/auth/cerrar-sesion";
import { exigirPaso } from "@/lib/auth/paso-dos-pasos";

import { ConfigurarDosPasos } from "./configurar";

export const metadata: Metadata = { title: "Configurar verificación en dos pasos · Sistema Avanza" };

export default function PaginaConfigurar() {
  return (
    <PantallaAcceso>
      <div className="flex w-full max-w-110 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-titulo text-4xl font-bold uppercase tracking-wide">
            Activa la verificación en dos pasos
          </h1>
          <p className="text-tenue">
            Los administradores entran con contraseña y con un código de su teléfono. Se configura una
            sola vez.
          </p>
        </div>

        <Suspense fallback={<p className="text-tenue" role="status">Cargando…</p>}>
          <Contenido />
        </Suspense>

        <form action={cerrarSesion} className="border-t border-borde pt-4 text-sm">
          <button type="submit" className="cursor-pointer font-semibold text-avanza-claro underline">
            Salir y entrar con otra cuenta
          </button>
        </form>
      </div>
    </PantallaAcceso>
  );
}

async function Contenido() {
  await exigirPaso("configurar");
  return <ConfigurarDosPasos />;
}
