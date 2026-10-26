-- Admin sin 2FA (aal1) no tiene poderes de Admin en la base de datos.
begin;
select plan(12);
select pruebas.sembrar();

select pruebas.entrar_como('admin', 'aal1');

select results_eq(
  $$ select nombre, rol::text from public.usuarios $$,
  $$ values ('admin', 'admin') $$,
  'admin sin 2FA solo ve su propia fila (la app la necesita para pedirle el código)'
);
select is_empty($$ select 1 from public.tiendas $$, 'admin sin 2FA no ve tiendas');
select is_empty($$ select 1 from public.productos $$, 'admin sin 2FA no ve el catálogo');
select is_empty($$ select 1 from public.producto_costos $$, 'admin sin 2FA no ve costos');
select results_eq(
  $$ with r as (update public.productos set precio_centavos = 1 returning 1) select count(*)::int from r $$,
  $$ values (0) $$,
  'admin sin 2FA no puede cambiar precios'
);
select results_eq(
  $$ with r as (update public.usuarios set rol = 'cajero'
                where id = pruebas.id_usuario('gerente_a') returning 1)
     select count(*)::int from r $$,
  $$ values (0) $$,
  'admin sin 2FA no puede cambiar roles'
);
select throws_ok(
  $$ insert into public.tiendas (nombre) values ('Tienda sin 2FA') $$,
  '42501', null,
  'admin sin 2FA no puede crear tiendas'
);
select throws_ok(
  $$ insert into public.usuario_tiendas (usuario_id, tienda_id)
     values (pruebas.id_usuario('admin'), pruebas.id_tienda('Tienda A')) $$,
  '42501', null,
  'admin sin 2FA no puede asignarse tiendas'
);

-- Con 2FA recupera todo.
select pruebas.entrar_como('admin', 'aal2');
select results_eq(
  $$ select count(*)::int from public.tiendas $$,
  $$ values (2) $$,
  'admin con 2FA ve todas las tiendas'
);
select results_eq(
  $$ select count(*)::int from public.producto_costos $$,
  $$ values (1) $$,
  'admin con 2FA ve costos'
);

-- Los demás roles no dependen de la 2FA.
select pruebas.entrar_como('gerente_a', 'aal1');
select results_eq(
  $$ select count(*)::int from public.producto_costos $$,
  $$ values (1) $$,
  'gerente sin 2FA sigue viendo costos (la 2FA solo se exige a Admin)'
);
select pruebas.entrar_como('cajero_a', 'aal1');
select results_eq(
  $$ select nombre from public.tiendas $$,
  $$ values ('Tienda A') $$,
  'cajero sin 2FA sigue viendo su tienda'
);

select * from finish();
rollback;
