import "server-only";

import { redirect } from "next/navigation";

import { rutaPendiente, type EstadoDosPasos } from "./dos-pasos";
import { obtenerUsuarioActual, type UsuarioActual } from "./usuario-actual";

// Las pantallas de 2FA solo se muestran a quien le toca ese paso; a los
// demás los manda a donde corresponde (login, el otro paso o la app).
export async function exigirPaso(
  paso: Extract<EstadoDosPasos, "verificar" | "configurar">,
): Promise<UsuarioActual> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/iniciar-sesion");
  if (usuario.dosPasos !== paso) redirect(rutaPendiente(usuario.dosPasos) ?? "/");
  return usuario;
}
