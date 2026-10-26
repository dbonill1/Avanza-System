begin;
select plan(20);
select pruebas.sembrar();

-- ---------------------------------------------------------------------------
-- productos
-- ---------------------------------------------------------------------------
select pruebas.entrar_como('vendedor_a');
select results_eq(
  $$ select sku, precio_centavos from public.productos $$,
  $$ values ('FIL-001'::text, 25000::bigint) $$,
  'vendedor ve el catálogo con precios'
);

select pruebas.entrar_como('bodega_b');
select results_eq(
  $$ select count(*)::int from public.productos $$,
  $$ values (1) $$,
  'el catálogo es común: bodega de la tienda B también lo ve'
);

select pruebas.entrar_como('inactivo_a');
select is_empty($$ select 1 from public.productos $$, 'usuario inactivo no ve el catálogo');

select pruebas.entrar_como('cajero_a');
select results_eq(
  $$ with r as (update public.productos set precio_centavos = 1 returning 1) select count(*)::int from r $$,
  $$ values (0) $$,
  'cajero no puede cambiar precios'
);
select throws_ok(
  $$ insert into public.productos (sku, nombre, precio_centavos) values ('X-1', 'X', 100) $$,
  '42501', null,
  'cajero no puede crear productos'
);

select pruebas.entrar_como('gerente_a');
select results_eq(
  $$ with r as (update public.productos set precio_centavos = 1 returning 1) select count(*)::int from r $$,
  $$ values (0) $$,
  'gerente tampoco puede cambiar precios (solo admin)'
);

select pruebas.entrar_como('admin');
select results_eq(
  $$ with r as (update public.productos set precio_centavos = 26000
                where sku = 'FIL-001' returning 1) select count(*)::int from r $$,
  $$ values (1) $$,
  'admin puede cambiar precios'
);
select results_eq(
  $$ with r as (delete from public.productos returning 1) select count(*)::int from r $$,
  $$ values (0) $$,
  'nadie borra productos, ni admin (se desactivan)'
);
select throws_ok(
  $$ insert into public.productos (sku, nombre, precio_centavos) values ('NEG-1', 'Negativo', -1) $$,
  '23514', null,
  'precio negativo se rechaza'
);
select throws_ok(
  $$ insert into public.productos (sku, nombre, precio_centavos) values ('FIL-001', 'Duplicado', 100) $$,
  '23505', null,
  'SKU duplicado se rechaza'
);
select throws_ok(
  $$ insert into public.productos (sku, nombre, precio_centavos) values (' FIL-002', 'Con espacio', 100) $$,
  '23514', null,
  'SKU con espacios alrededor se rechaza'
);

-- ---------------------------------------------------------------------------
-- producto_costos: solo gerente y admin
-- ---------------------------------------------------------------------------
select pruebas.entrar_como('vendedor_a');
select is_empty($$ select 1 from public.producto_costos $$, 'vendedor no ve costos');

select pruebas.entrar_como('cajero_a');
select is_empty($$ select 1 from public.producto_costos $$, 'cajero no ve costos');
select throws_ok(
  $$ insert into public.producto_costos (producto_id, costo_promedio_centavos)
     values (pruebas.id_producto('FIL-001'), 1) $$,
  '42501', null,
  'cajero no puede registrar costos'
);

select pruebas.entrar_como('bodega_b');
select is_empty($$ select 1 from public.producto_costos $$, 'bodega no ve costos');

select pruebas.entrar_como('gerente_a');
select results_eq(
  $$ select costo_promedio_centavos from public.producto_costos $$,
  $$ values (15000::bigint) $$,
  'gerente ve costos'
);
select results_eq(
  $$ with r as (update public.producto_costos set costo_promedio_centavos = 1 returning 1)
     select count(*)::int from r $$,
  $$ values (0) $$,
  'gerente no puede cambiar costos'
);

-- ---------------------------------------------------------------------------
-- usuario_pines: nadie desde la app, ni admin
-- ---------------------------------------------------------------------------
select pruebas.entrar_como('admin');
select throws_ok(
  $$ select pin_hash from public.usuario_pines $$,
  '42501', null,
  'ni admin puede leer hashes de PIN desde la app'
);

select pruebas.entrar_como('gerente_a');
select throws_ok(
  $$ select pin_hash from public.usuario_pines $$,
  '42501', null,
  'gerente no puede leer ni su propio hash de PIN'
);

select pruebas.entrar_como_anon();
select throws_ok(
  $$ select 1 from public.productos $$,
  '42501', null,
  'anon no puede leer el catálogo'
);

select * from finish();
rollback;
