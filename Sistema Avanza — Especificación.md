# **Sistema Avanza — Especificación**

Oct 26, 2026 · @Diego

## **Resumen y alcance**

El Sistema Avanza es una app web interna para las tres tiendas que maneja inventario, caja, descuentos, cotizaciones, apartados, pedidos y estadísticas. La factura oficial se sigue haciendo a mano en talonario; la app sirve como guía del desglose de cada venta y como control de inventario y efectivo.

**Dentro del alcance**

* Catálogo de productos (importado de Excel  
* , \~718 productos)  
* Inventario por tienda, con traslados entre tiendas  
* Caja: órdenes de venta, cobro, apertura y cierre con arqueo  
* Descuentos con límites por rol y aprobación  
* Cotizaciones con validez y conversión a venta  
* Apartados con abonos y plazo  
* Pedidos de productos que no hay en stock  
* Estadísticas de ventas, margen e inventario  
* Bitácora de auditoría de acciones sensibles

**Fuera del alcance (por ahora)**

* Emisión de facturas fiscales (requiere autorización de la DGI)  
* Pagos con tarjeta integrados  
* Tienda en línea para clientes

El documento que genera la app se llama **Orden de venta** y lleva la leyenda "Documento interno – no válido como factura".

## **Decisiones pendientes de confirmar**

Cada regla de este documento tiene un valor propuesto; cambia la columna "Propuesta" con tu decisión real y Claude ajusta el resto.

| \# | Tema | Pregunta | Propuesta |
| :---- | :---- | :---- | :---- |
| 1 | Apartado | Abono mínimo para apartar | 30% del total |
| 2 | Apartado | Plazo máximo para completar el pago | 30 días |
| 3 | Apartado | Si el cliente no completa el pago | Producto vuelve a stock; abono queda como saldo a favor 60 días |
| 4 | Descuentos | Máximo sin aprobación por rol | Vendedor 0%, Cajero 5%, Gerente 15%, Admin sin límite |
| 5 | Descuentos | Precio mayorista para clientes frecuentes | Lista de precio "Mayorista" asignable por cliente |
| 6 | Cotizaciones | Días de validez | 7 días; al vencer se recalcula con precio actual |
| 7 | Devoluciones | Plazo y quién autoriza | 15 días con factura; autoriza Gerente |
| 8 | Moneda | Moneda de precios | Precio base en córdobas; muestra equivalente en USD con tipo de cambio del día |
| 9 | Caja | ¿Se permite vender con stock en cero? | No; se crea un Pedido |
| 10 | Inventario | ¿Costo promedio o último costo? | Costo promedio ponderado |
| 11 | Equipos | Dispositivo de caja por tienda | Una PC o tablet por tienda \+ impresora térmica 80 mm |
| 12 | Internet | ¿La caja debe funcionar sin internet? | Fase 4; fases 1–3 asumen conexión |
| 13 | IVA | ¿Los precios incluyen IVA? | Sí, precios con IVA incluido; se muestra desglosado |

## **Roles y permisos**

Cinco roles, cada usuario asignado a una o más tiendas; nadie ve ni opera la caja de una tienda que no le corresponde.

| Acción | Vendedor | Cajero | Bodega | Gerente | Admin |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Crear orden de venta / cotización | Sí | Sí | No | Sí | Sí |
| Cobrar y cerrar venta | No | Sí | No | Sí | Sí |
| Abrir y cerrar caja | No | Sí | No | Sí | Sí |
| Aplicar descuento | No | Hasta 5% | No | Hasta 15% | Sin límite |
| Aprobar descuento mayor | No | No | No | Sí (hasta 15%) | Sí |
| Anular venta | No | No | No | Sí, con motivo | Sí, con motivo |
| Recibir mercadería | No | No | Sí | Sí | Sí |
| Ajustar inventario | No | No | Solicita | Aprueba | Sí |
| Trasladar entre tiendas | No | No | Sí | Sí | Sí |
| Cambiar precios y costos | No | No | No | No | Sí |
| Ver costos y márgenes | No | No | No | Sí | Sí |
| Ver estadísticas | No | No | No | Su tienda | Todas |
| Gestionar usuarios | No | No | No | No | Sí |

La aprobación de un gerente se hace con su PIN en la misma pantalla de caja y queda registrada en la bitácora.

## **Reglas de negocio**

Estas reglas son la fuente de verdad para Claude; los valores marcados como propuesta se ajustan según la tabla de decisiones.

### **Ventas y caja**

1. Toda venta empieza como **orden de venta** en estado Borrador.  
2. El servidor calcula precios, descuentos, IVA y total; el navegador solo muestra.  
3. Para cerrar la venta el cajero registra el **número de factura de talonario**. Es obligatorio y no se puede repetir.  
4. Al cerrar la venta se descuenta el inventario y el pago queda ligado a la sesión de caja abierta.  
5. Formas de pago: efectivo C\$, efectivo USD, transferencia, mixto. El tipo de cambio queda guardado en la venta.  
6. No se puede cobrar sin una sesión de caja abierta.  
7. Cierre de caja: el cajero cuenta efectivo por denominación; el sistema compara efectivo contado, total en la app y suma de facturas del día, y marca diferencias.

### **Talonarios**

1. Admin registra el rango de facturas asignado a cada caja (ej. 0501–0550).  
2. El sistema avisa si un número está fuera de rango, repetido o si quedan números saltados al cerrar el día.  
3. Una factura anulada se registra con su número y motivo.

### **Descuentos**

1. Tipos: porcentaje por línea, porcentaje a toda la orden, monto fijo, y lista de precio Mayorista por cliente.  
2. Cada rol tiene un máximo (ver Roles). Arriba del máximo se pide PIN de gerente o admin.  
3. Todo descuento guarda quién lo dio, quién lo aprobó y el motivo.  
4. El precio final nunca puede quedar por debajo del costo sin aprobación de Admin.

### **Cotizaciones**

1. Se crean con cliente, productos, precios y fecha de vencimiento (propuesta: 7 días).  
2. No reservan inventario.  
3. Se pueden convertir en orden de venta, apartado o pedido. Si está vencida, se recalcula con precios actuales.  
4. Se pueden compartir por WhatsApp como imagen o PDF.

### **Apartados**

1. Requieren cliente con nombre y teléfono.  
2. Abono mínimo (propuesta: 30%) y plazo máximo (propuesta: 30 días).  
3. El producto pasa a **reservado**: no se puede vender a otro cliente.  
4. Cada abono se registra como pago en la caja del día.  
5. Al completar el pago se convierte en venta y se registra la factura de talonario.  
6. Vencido el plazo, el gerente decide: extender, cancelar con saldo a favor, o cancelar con devolución.

### **Pedidos**

1. Para productos sin stock o que se traen de China.  
2. Pueden llevar anticipo. Estados: Solicitado → Ordenado al proveedor → Recibido → Entregado.  
3. Al recibir la mercadería, el stock queda reservado para ese cliente.

### **Devoluciones**

1. Requieren la venta original y autorización de Gerente.  
2. El producto vuelve a stock como disponible o como dañado.  
3. Se devuelve dinero de la caja o se da saldo a favor.

### **Inventario**

1. El stock **nunca se edita directamente**: todo es un movimiento (entrada, venta, devolución, traslado, ajuste, reserva).  
2. Stock por producto y por tienda, en tres estados: disponible, reservado, dañado.  
3. Traslado entre tiendas \= salida en una \+ entrada en otra, confirmada por quien recibe.  
4. Los ajustes requieren motivo y aprobación de Gerente.  
5. Costo promedio ponderado, recalculado en cada entrada.

## **Flujos principales**

![flujo de documentos · cotización a venta cerrada][image1]

flujo de documentos · cotización a venta cerrada

Una cotización puede convertirse en venta, apartado o pedido; los tres solo se cierran en caja con el número de factura de talonario. El apartado llega a caja al completar el pago y el pedido al recibir la mercadería; cada cobro y abono entra en la sesión de caja del día.

## **Esquema de base de datos**

Postgres con 19 tablas; todo monto se guarda en centavos como entero (bigint) y toda tabla lleva id (uuid), created\_at y created\_by.

| Tabla | Para qué | Campos clave |
| :---- | :---- | :---- |
| tiendas | Las tres tiendas | nombre, dirección, activa |
| usuarios | Personal con acceso | nombre, rol, pin\_hash, activo |
| usuario\_tiendas | Qué tiendas ve cada usuario | usuario\_id, tienda\_id |
| productos | Catálogo | sku, nombre, categoría, marca, precio\_centavos, costo\_promedio\_centavos, activo |
| listas\_precio | Precio normal y mayorista | nombre, producto\_id, precio\_centavos |
| clientes | Clientes y su historial | nombre, teléfono, tipo (ganadero, minero, taller, otro), lista\_precio\_id, saldo\_favor\_centavos |
| movimientos\_inventario | Única fuente del stock | producto\_id, tienda\_id, tipo, cantidad (+/−), estado (disponible, reservado, dañado), referencia\_tipo, referencia\_id, motivo |
| traslados | Envíos entre tiendas | origen\_id, destino\_id, estado, enviado\_por, recibido\_por |
| cotizaciones | Cotizaciones | cliente\_id, tienda\_id, vence\_el, estado, total\_centavos |
| ordenes | Ventas, apartados y pedidos | tipo (venta, apartado, pedido), estado, cliente\_id, tienda\_id, subtotal, descuento, iva, total (centavos), tipo\_cambio, factura\_numero, vence\_el |
| orden\_items | Líneas de cada orden | orden\_id, producto\_id, cantidad, precio\_unit\_centavos, descuento\_centavos, costo\_unit\_centavos |
| descuentos | Registro de cada descuento | orden\_id, item\_id, tipo, valor, dado\_por, aprobado\_por, motivo |
| pagos | Cobros y abonos | orden\_id, sesion\_caja\_id, metodo, moneda, monto\_centavos, tipo\_cambio |
| sesiones\_caja | Apertura y cierre | tienda\_id, cajero\_id, fondo\_inicial, abierta\_el, cerrada\_el, contado\_centavos, esperado\_centavos, diferencia\_centavos |
| talonarios | Rangos de facturas por caja | tienda\_id, desde, hasta, activo |
| facturas\_manuales | Números usados o anulados | talonario\_id, número, orden\_id, estado (usada, anulada), motivo |
| devoluciones | Devoluciones | orden\_id, items, motivo, autorizado\_por, reembolso\_tipo |
| tipo\_cambio | Tasa del día | fecha, córdobas\_por\_usd |
| bitacora | Auditoría | usuario\_id, acción, entidad, entidad\_id, antes (json), después (json) |

**Vistas calculadas:** stock\_actual (suma de movimientos por producto, tienda y estado) y ventas\_diarias (para estadísticas).

**Restricciones importantes:** facturas\_manuales con número único por talonario; movimientos\_inventario y bitacora solo permiten insertar, nunca editar ni borrar.

## **Estadísticas y reportes**

Un panel por tienda y uno consolidado, con filtro por rango de fechas; todos los números salen de las órdenes cerradas y los movimientos de inventario.

| Reporte | Qué responde | Quién lo ve |
| :---- | :---- | :---- |
| Ventas por día, semana y mes | ¿Cómo vamos contra el periodo anterior? | Gerente (su tienda), Admin |
| Ventas por tienda | ¿Qué tienda vende más? | Admin |
| Margen por producto y categoría | ¿Dónde se gana más? | Gerente, Admin |
| Top 20 productos | ¿Qué se vende más, en unidades y en córdobas? | Gerente, Admin |
| Productos sin rotación | ¿Qué lleva 60+ días sin venderse? | Gerente, Admin |
| Stock bajo | ¿Qué hay que reordenar? | Bodega, Gerente, Admin |
| Ventas por tipo de cliente | ¿Cuánto aportan ganaderos, mineros, talleres? | Admin |
| Ticket promedio | ¿Cuánto gasta un cliente por compra? | Gerente, Admin |
| Descuentos dados | ¿Quién da descuentos, cuánto y por qué? | Admin |
| Diferencias de caja | ¿Qué cierres no cuadraron? | Admin |
| Apartados y pedidos abiertos | ¿Qué está pendiente y qué vence pronto? | Cajero, Gerente, Admin |
| Valor del inventario | ¿Cuánto dinero hay en mercadería? | Admin |

Todos los reportes se pueden exportar a Excel/CSV .

## **Seguridad y controles antifraude**

El riesgo principal es el fraude interno (descuentos inflados, anulaciones, ajustes de inventario), así que los permisos se aplican en la base de datos y cada acción sensible queda registrada.

### **Controles en el sistema**

* Row Level Security en todas las tablas: cada usuario solo lee y escribe datos de sus tiendas y según su rol.  
* Precios, descuentos y totales se recalculan en el servidor; lo que mande el navegador no se acepta.  
* Validación de toda entrada con Zod.  
* movimientos\_inventario, pagos y bitacora son solo de inserción.  
* Acciones con PIN de gerente: descuento sobre el límite, anulación, ajuste de inventario, devolución.  
* Contraseñas fuertes; 2FA obligatorio para Admin; PIN de 4–6 dígitos para cajeros; cierre de sesión tras 15 minutos sin uso.  
* Secretos solo en variables de entorno; la service\_role key de Supabase nunca llega al navegador.  
* Respaldo diario automático, con una prueba de restauración al mes.

### **Pruebas de seguridad antes de salir a producción**

* ☐ Tests automáticos de permisos (ej. cajero no puede dar 20%; usuario de tienda A no ve tienda B)  
* ☐ Tests de cálculo de dinero (totales, IVA, descuentos, abonos, cierre de caja)  
* ☐ /security-review de Claude Code en cada módulo  
* ☐ Semgrep o CodeQL en GitHub  
* ☐ Dependabot y npm audit sin vulnerabilidades altas  
* ☐ gitleaks: ningún secreto en el repositorio  
* ☐ Supabase Security Advisor sin alertas  
* ☐ OWASP ZAP contra el ambiente de staging  
* ☐ Checklist OWASP ASVS nivel 1  
* ☐ Piloto de 2–4 semanas en una tienda, cuadrando caja e inventario físico

## **Stack y arquitectura**

Next.js \+ TypeScript en Vercel como app instalable (PWA), con Supabase para base de datos, autenticación y permisos.

| Capa | Herramienta | Notas |
| :---- | :---- | :---- |
| Frontend | Next.js (App Router) \+ TypeScript \+ Tailwind \+ shadcn/ui | PWA instalable en PC, tablet o celular |
| Lógica de negocio | Server Actions / API routes de Next.js | Aquí se calculan precios, descuentos y totales |
| Base de datos | Supabase Postgres | RLS en todas las tablas |
| Autenticación | Supabase Auth | Email \+ contraseña; PIN para cajeros; 2FA para Admin |
| Validación | Zod | Mismos esquemas en cliente y servidor |
| Tests | Vitest (lógica) \+ Playwright (flujos completos) | Corren en GitHub Actions en cada push |
| Hosting | Vercel (app) \+ Supabase (datos) | Ambientes separados: staging y producción |
| Impresión | Impresora térmica 80 mm vía navegador | Orden de venta, ticket de apartado, cotización |

La app es la fuente de verdad del stock y las ventas.

## **Plan de construcción por fases**

Cuatro fases; cada una termina con algo usable en tienda y pasa las pruebas de seguridad antes de la siguiente.

1. **Fase 1 — Base y caja (MVP)**  
   * Proyecto Next.js \+ Supabase, staging y producción  
   * Usuarios, roles, tiendas, RLS  
   * Importar productos de Excel  
   * Inventario por movimientos y entrada de mercadería  
   * Orden de venta, cobro, número de factura de talonario  
   * Apertura y cierre de caja con arqueo  
   * **Salida:** piloto en una tienda  
2. **Fase 2 — Descuentos, cotizaciones y apartados**  
   * Descuentos con límite por rol y PIN de gerente  
   * Clientes y lista de precio Mayorista  
   * Cotizaciones y envío por WhatsApp  
   * Apartados con abonos, reservas y vencimientos  
   * Pedidos, devoluciones y traslados entre tiendas  
   * Control de talonarios  
   * **Salida:** las tres tiendas usando el sistema  
3. **Fase 3 — Estadísticas e integraciones**  
   * Paneles de estadísticas y exportación a Excel

4. **Fase 4 — Robustez**  
   * Modo sin internet en caja con sincronización  
   * Auditoría de seguridad formal o pentest  
       
     CLAUDE.md inicial

Copia este bloque a un archivo CLAUDE.md en la raíz del repositorio; Claude Code lo lee en cada sesión.

\# Sistema Avanza

App interna de inventario, caja, descuentos, cotizaciones, apartados,  
pedidos y estadísticas para Avanza Autopartes (1 tiendas, Nicaragua).  
La factura oficial es manual (talonario). La app genera "Orden de venta",  
que dice "Documento interno – no válido como factura".

\#\# Stack  
\- Next.js (App Router) \+ TypeScript estricto \+ Tailwind \+ shadcn/ui  
\- Supabase (Postgres, Auth, RLS)  
\- Zod para validación, Vitest y Playwright para tests  
\- Deploy en Vercel. Ambientes: staging y producción.

\#\# Reglas que nunca se rompen  
1\. Dinero en centavos como entero (bigint). Nunca float.  
2\. Precios, descuentos, IVA y totales se calculan SOLO en el servidor.  
3\. El stock nunca se edita: todo cambio es un insert en movimientos\_inventario.  
4\. movimientos\_inventario, pagos y bitacora son solo de inserción.  
5\. Toda tabla tiene RLS. Ninguna tabla nueva sin su política.  
6\. Toda acción sensible (descuento sobre límite, anulación, ajuste,  
   devolución, cambio de precio) se registra en bitacora.  
7\. Secretos solo en variables de entorno. La service\_role key nunca  
   en código de cliente.  
8\. Validar toda entrada con Zod en el servidor.  
9\. Para cerrar una venta es obligatorio el número de factura de  
   talonario, único por talonario.

\#\# Roles  
vendedor, cajero, gerente, admin. Ver docs/especificacion.md.

\#\# Cómo trabajar  
\- Tareas pequeñas. Antes de cambios grandes, proponer un plan.  
\- Cada función de dinero o permisos lleva tests.  
\- Correr \`npm test\` y \`npm run lint\` antes de terminar una tarea.  
\- Interfaz en español (Nicaragua). Código y nombres de variables en español.  
\- No agregar dependencias sin explicar por qué.  
Guarda también este documento completo como docs/especificacion.md en el repositorio, para que Claude lo consulte.

[image1]: <data:image/png;base64,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>