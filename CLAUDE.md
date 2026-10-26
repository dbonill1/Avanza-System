# Sistema Avanza

App interna de inventario, caja, descuentos, cotizaciones, apartados,
pedidos y estadísticas para Avanza Autopartes (3 tiendas, Nicaragua).
La factura oficial es manual (talonario). La app genera "Orden de venta",
que dice "Documento interno – no válido como factura".

Especificación completa: docs/especificacion.md
Next.js 16 cambió APIs y convenciones: leer AGENTS.md antes de escribir código de Next.

## Stack
- Next.js (App Router) + TypeScript estricto + Tailwind + shadcn/ui
- Supabase (Postgres, Auth, RLS)
- Zod para validación, Vitest y Playwright para tests
- Deploy en Vercel. Ambientes: staging y producción.
- Gestor de paquetes: npm

## Reglas que nunca se rompen
1. Dinero en centavos como entero (bigint). Nunca float.
2. Precios, descuentos, IVA y totales se calculan SOLO en el servidor.
3. El stock nunca se edita: todo cambio es un insert en movimientos_inventario.
4. movimientos_inventario, pagos y bitacora son solo de inserción.
5. Toda tabla tiene RLS. Ninguna tabla nueva sin su política.
6. Toda acción sensible (descuento sobre límite, anulación, ajuste,
   devolución, cambio de precio) se registra en bitacora.
7. Secretos solo en variables de entorno. La service_role key nunca
   en código de cliente (el cliente admin lleva `import "server-only"`).
8. Validar toda entrada con Zod en el servidor.
9. Para cerrar una venta es obligatorio el número de factura de
   talonario, único por talonario.
10. RLS filtra filas, no columnas: un dato que no todos los roles pueden ver
    (costos, pin_hash) va en su propia tabla (producto_costos, usuario_pines).

## Roles
vendedor, cajero, bodega, gerente, admin. Ver la tabla de permisos en
docs/especificacion.md.

## Cómo trabajar
- Tareas pequeñas. Antes de cambios grandes, proponer un plan.
- Cada función de dinero o permisos lleva tests.
- Correr `npm test`, `npm run lint` y `npm run typecheck` antes de terminar una tarea.
- Interfaz en español (Nicaragua). Código y nombres de variables en español
  (los archivos de convención de Next.js, como page.tsx, se quedan como son).
- No agregar dependencias sin explicar por qué.
