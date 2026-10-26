import type { Metadata } from "next";
import { Suspense } from "react";

import { PantallaAcceso } from "@/components/pantalla-acceso";
import { cerrarSesion } from "@/lib/auth/cerrar-sesion";
import { exigirPaso } from "@/lib/auth/paso-dos-pasos";

import { FormularioCodigo } from "./formulario-codigo";

export const metadata: Metadata = { title: "Verificación en dos pasos · Sistema Avanza" };

export default function PaginaVerificar() {
  return (
    <PantallaAcceso>
      <div className="flex w-full max-w-100 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-titulo text-4xl font-bold uppercase tracking-wide">
            Verificación en dos pasos
          </h1>
          <p className="text-tenue">
            Abre tu app autenticadora y escribe el código de Sistema Avanza.
          </p>
        </div>

        <Suspense fallback={<p className="text-tenue" role="status">Cargando…</p>}>
          <Contenido />
        </Suspense>

        <div className="flex flex-col gap-3 border-t border-borde pt-4 text-sm leading-relaxed text-tenue">
          <p>
            ¿Perdiste el teléfono? Otro administrador puede quitar tu 2FA desde Supabase para que la
            configures de nuevo.
          </p>
          <form action={cerrarSesion}>
            <button type="submit" className="cursor-pointer font-semibold text-avanza-claro underline">
              Salir y entrar con otra cuenta
            </button>
          </form>
        </div>
      </div>
    </PantallaAcceso>
  );
}

async function Contenido() {
  await exigirPaso("verificar");
  return <FormularioCodigo />;
}
