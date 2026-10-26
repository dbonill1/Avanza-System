import { Marca } from "./marca";

// Pantalla partida de login y 2FA: panel de marca a la izquierda y el
// formulario a la derecha (en pantallas angostas se apilan).
export function PantallaAcceso({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-wrap">
      <section className="relative flex min-h-105 flex-[1_1_560px] flex-col justify-between overflow-hidden border-r border-borde bg-linear-160 from-elevado to-fondo p-16">
        <Marca tamano={56} />
        <div className="flex max-w-130 flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-avanza-claro">
            Autopartes
          </p>
          <p className="font-titulo text-7xl leading-[0.95] font-extrabold italic">
            Inventario y caja de las tres tiendas
          </p>
          <p className="text-lg leading-normal text-tenue">
            Sistema interno. La factura oficial se sigue llenando en el talonario.
          </p>
        </div>
        <div className="h-1.5 w-30 bg-avanza" />
      </section>

      <section className="flex flex-[1_1_480px] items-center justify-center px-6 py-12">
        {children}
      </section>
    </div>
  );
}

export const claseCampo =
  "h-12 rounded-md border border-borde-campo bg-campo px-4 text-base text-texto placeholder:text-tenue";

export const claseBotonPrincipal =
  "h-13 cursor-pointer rounded-md bg-avanza font-titulo text-xl font-bold uppercase tracking-widest text-white transition-opacity disabled:cursor-wait disabled:opacity-70";
