"use client";

import { useActionState } from "react";

import { claseBotonPrincipal, claseCampo } from "@/components/pantalla-acceso";
import type { EstadoLogin } from "@/lib/auth/esquemas";

import { iniciarSesion } from "./acciones";

const estadoInicial: EstadoLogin = { error: null, correo: "" };

export function FormularioLogin() {
  const [estado, accion, enviando] = useActionState(iniciarSesion, estadoInicial);

  return (
    <form action={accion} noValidate className="flex w-full max-w-100 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-titulo text-4xl font-bold uppercase tracking-wide">
          Iniciar sesión
        </h2>
        <p className="text-tenue">Entra con el correo que te asignó el administrador.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="correo" className="text-sm font-semibold text-suave">
          Correo
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          autoComplete="username"
          required
          defaultValue={estado.correo}
          placeholder="nombre@avanza.com.ni"
          className={claseCampo}
          aria-describedby={estado.error ? "error-login" : undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="clave" className="text-sm font-semibold text-suave">
          Contraseña
        </label>
        <input
          id="clave"
          name="clave"
          type="password"
          autoComplete="current-password"
          required
          className={claseCampo}
          aria-describedby={estado.error ? "error-login" : undefined}
        />
      </div>

      {estado.error ? (
        <p
          id="error-login"
          role="alert"
          className="rounded-md bg-error-fondo px-4 py-3 font-semibold text-error"
        >
          {estado.error}
        </p>
      ) : null}

      <button type="submit" disabled={enviando} className={claseBotonPrincipal}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>

      <div className="flex flex-col gap-2 border-t border-borde pt-4 text-sm leading-relaxed text-tenue">
        <p>¿Olvidaste tu contraseña? Pide al administrador que la restablezca.</p>
        <p>Los administradores confirman con un código de su app autenticadora.</p>
      </div>
    </form>
  );
}
