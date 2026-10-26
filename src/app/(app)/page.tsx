import { Suspense } from "react";

import { ETIQUETA_ROL, requerirUsuario } from "@/lib/auth/usuario-actual";

export default function Inicio() {
  return (
    <>
      <header className="flex flex-wrap items-center gap-4 border-b border-borde bg-panel px-8 py-4">
        <h1 className="font-titulo text-3xl font-bold uppercase tracking-wide">Inicio</h1>
      </header>
      {/* Al navegar entre páginas de (app) el layout no se vuelve a renderizar,
          así que cada página que lee la sesión necesita su propio Suspense. */}
      <Suspense fallback={<p className="px-8 py-8 text-tenue" role="status">Cargando…</p>}>
        <Contenido />
      </Suspense>
    </>
  );
}

async function Contenido() {
  // cache() hace que esta lectura no repita la consulta del layout.
  const usuario = await requerirUsuario();

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <div className="flex flex-col gap-2">
        <p className="font-titulo text-5xl font-extrabold italic">Hola, {usuario.nombre}</p>
        <p className="text-lg text-tenue">
          Entraste como {ETIQUETA_ROL[usuario.rol].toLowerCase()}.
        </p>
      </div>

      <section aria-labelledby="titulo-tiendas" className="max-w-xl rounded-lg border border-borde bg-panel">
        <h2
          id="titulo-tiendas"
          className="border-b border-borde px-5 py-3 font-titulo text-xl font-bold uppercase"
        >
          {usuario.rol === "admin" ? "Tiendas" : "Tus tiendas"}
        </h2>
        {usuario.tiendas.length > 0 ? (
          <ul className="flex flex-col">
            {usuario.tiendas.map((t) => (
              <li key={t.id} className="border-b border-linea px-5 py-3 last:border-b-0">
                {t.nombre}
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-4 text-tenue">
            Todavía no tienes tienda asignada. Pide al administrador que te asigne una.
          </p>
        )}
      </section>

      <p className="text-tenue">Caja, catálogo y cierre de caja llegan en los siguientes pasos.</p>
    </div>
  );
}
