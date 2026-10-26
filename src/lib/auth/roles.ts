import type { Database } from "@/types/base-datos";

export type Rol = Database["public"]["Enums"]["rol_usuario"];

export const ETIQUETA_ROL: Record<Rol, string> = {
  vendedor: "Vendedor",
  cajero: "Cajero",
  bodega: "Bodega",
  gerente: "Gerente",
  admin: "Administrador",
};
