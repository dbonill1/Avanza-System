"use client";

import { useActionState } from "react";

import { claseBotonPrincipal } from "@/components/pantalla-acceso";
import type { EstadoCodigo } from "@/lib/auth/dos-pasos";

import { verificarCodigo } from "./acciones";

const estadoInicial: EstadoCodigo = { error: null };

export function FormularioCodigo() {
  const [estado, accion, enviando] = useActionState(verificarCodigo, estadoInicial);

  return (
    <form action={accion} noValidate className="flex flex-col gap-6">
      <CampoCodigo error={estado.error} />
      <button type="submit" disabled={enviando} className={claseBotonPrincipal}>
        {enviando ? "Verificando…" : "Verificar"}
      </button>
    </form>
  );
}

// Campo grande de 6 dígitos; el teclado numérico y el autocompletado de
// códigos (one-time-code) ayudan si se usa desde el celular.
export function CampoCodigo({ error }: { error: string | null }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="codigo" className="text-sm font-semibold text-suave">
        Código de 6 dígitos
      </label>
      <input
        id="codigo"
        name="codigo"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={7}
        required
        autoFocus
        placeholder="123 456"
        aria-describedby={error ? "error-codigo" : undefined}
        className="h-16 rounded-md border border-borde-campo bg-campo px-4 text-center font-titulo text-4xl font-semibold tracking-[0.3em] text-texto placeholder:text-borde-campo"
      />
      {error ? (
        <p
          id="error-codigo"
          role="alert"
          className="rounded-md bg-error-fondo px-4 py-3 font-semibold text-error"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
