"use client";

import { useActionState, useEffect, useState } from "react";

import { claseBotonPrincipal } from "@/components/pantalla-acceso";
import type { EstadoCodigo } from "@/lib/auth/dos-pasos";

import { CampoCodigo } from "../verificar-2fa/formulario-codigo";

import { confirmarFactor, prepararFactor, type NuevoFactor } from "./acciones";

const estadoInicial: EstadoCodigo = { error: null };

export function ConfigurarDosPasos() {
  const [factor, setFactor] = useState<NuevoFactor | null>(null);
  const [estado, accion, enviando] = useActionState(confirmarFactor, estadoInicial);

  // El QR se genera al abrir la pantalla (no al prerenderizar ni prefetch).
  useEffect(() => {
    let vigente = true;
    prepararFactor().then((nuevo) => {
      if (vigente) setFactor(nuevo);
    });
    return () => {
      vigente = false;
    };
  }, []);

  if (!factor) {
    return (
      <p className="text-tenue" role="status">
        Generando código QR…
      </p>
    );
  }
  if (!factor.ok) {
    return (
      <p role="alert" className="rounded-md bg-error-fondo px-4 py-3 font-semibold text-error">
        {factor.error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-col gap-4">
        <li className="flex flex-col gap-3">
          <span className="font-semibold">
            1. Escanea este código con tu app autenticadora (Google Authenticator, Microsoft
            Authenticator, 1Password…).
          </span>
          <div className="self-start rounded-lg bg-white p-3">
            {/* El QR llega como SVG en data URI desde Supabase: next/image no
                aplica (no hay nada que optimizar y bloquea SVG por diseño). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={factor.qr} alt="Código QR para la app autenticadora" width={184} height={184} />
          </div>
          <details className="text-sm text-tenue">
            <summary className="cursor-pointer font-semibold text-suave">
              ¿No puedes escanearlo? Escribe esta clave en la app
            </summary>
            <code className="mt-2 block break-all rounded-md bg-campo px-3 py-2 font-mono text-base text-texto">
              {factor.secreto.match(/.{1,4}/g)?.join(" ")}
            </code>
          </details>
        </li>
        <li className="font-semibold">2. Escribe el código que te muestra la app.</li>
      </ol>

      <form action={accion} noValidate className="flex flex-col gap-6">
        <input type="hidden" name="factorId" value={factor.factorId} />
        <CampoCodigo error={estado.error} />
        <button type="submit" disabled={enviando} className={claseBotonPrincipal}>
          {enviando ? "Verificando…" : "Activar y entrar"}
        </button>
      </form>
    </div>
  );
}
