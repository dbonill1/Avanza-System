import Link from "next/link";

import { Marca } from "@/components/marca";
import { ETIQUETA_ROL, type Rol, type UsuarioActual } from "@/lib/auth/usuario-actual";

import { cerrarSesion } from "./acciones";

type Seccion = { nombre: string; roles: Rol[] };

// Pantallas de la Fase 1 y quién las usa (tabla de permisos de la especificación).
// Se activan como enlaces cuando cada pantalla exista.
const PROXIMAS: Seccion[] = [
  { nombre: "Caja", roles: ["vendedor", "cajero", "gerente", "admin"] },
  { nombre: "Catálogo e inventario", roles: ["vendedor", "cajero", "bodega", "gerente", "admin"] },
  { nombre: "Cierre de caja", roles: ["cajero", "gerente", "admin"] },
];

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

export function MenuLateral({ usuario }: { usuario: UsuarioActual }) {
  const secciones = PROXIMAS.filter((s) => s.roles.includes(usuario.rol));
  const tiendas =
    usuario.rol === "admin" ? "Todas las tiendas" : usuario.tiendas.map((t) => t.nombre).join(", ");

  return (
    <nav
      aria-label="Menú principal"
      className="flex min-w-55 max-w-62 flex-[1_1_248px] flex-col gap-8 border-r border-borde bg-panel px-4 py-6"
    >
      <div className="px-2">
        <Marca />
      </div>

      <div className="flex flex-col gap-1">
        <Link
          href="/"
          aria-current="page"
          className="flex h-11 items-center gap-3 rounded-md bg-avanza px-3 font-semibold text-white"
        >
          Inicio
        </Link>
        {secciones.map((s) => (
          <span
            key={s.nombre}
            aria-disabled="true"
            className="flex h-11 items-center justify-between gap-3 rounded-md px-3 text-tenue"
          >
            {s.nombre}
            <span className="rounded-full border border-borde-campo px-2 text-xs">Pronto</span>
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-3 rounded-lg bg-elevado p-3">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-borde-campo font-bold"
          >
            {iniciales(usuario.nombre)}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold">{usuario.nombre}</span>
            <span className="truncate text-sm text-tenue">
              {ETIQUETA_ROL[usuario.rol]} · {tiendas || "Sin tienda asignada"}
            </span>
          </div>
        </div>
        <form action={cerrarSesion}>
          <button
            type="submit"
            className="h-10 w-full cursor-pointer rounded-md border border-borde-campo text-sm font-semibold text-suave hover:bg-campo"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </nav>
  );
}
