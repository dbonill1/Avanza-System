import type { Metadata } from "next";

import { Marca } from "@/components/marca";

import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = { title: "Iniciar sesión · Sistema Avanza" };

export default function PaginaIniciarSesion() {
  return (
    <div className="flex min-h-screen flex-wrap">
      <section className="relative flex min-h-105 flex-[1_1_560px] flex-col justify-between overflow-hidden border-r border-borde bg-linear-160 from-elevado to-fondo p-16">
        <Marca tamano={56} />
        <div className="flex max-w-130 flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-avanza-claro">
            Autopartes
          </p>
          <h1 className="font-titulo text-7xl leading-[0.95] font-extrabold italic">
            Inventario y caja de las tres tiendas
          </h1>
          <p className="text-lg leading-normal text-tenue">
            Sistema interno. La factura oficial se sigue llenando en el talonario.
          </p>
        </div>
        <div className="h-1.5 w-30 bg-avanza" />
      </section>

      <section className="flex flex-[1_1_480px] items-center justify-center px-6 py-12">
        <FormularioLogin />
      </section>
    </div>
  );
}
