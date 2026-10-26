import type { Metadata } from "next";

import { PantallaAcceso } from "@/components/pantalla-acceso";

import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = { title: "Iniciar sesión · Sistema Avanza" };

export default function PaginaIniciarSesion() {
  return (
    <PantallaAcceso>
      <FormularioLogin />
    </PantallaAcceso>
  );
}
