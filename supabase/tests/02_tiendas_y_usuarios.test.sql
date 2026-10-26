begin;
select plan(24);
select pruebas.sembrar();

-- ---------------------------------------------------------------------------
-- tiendas
-- ---------------------------------------------------------------------------
select pruebas.entrar_como('vendedor_a');
select results_eq(
  $$ select nombre from public.tiendas order by nombre $$,
  $$ values ('Tienda A') $$,
  'vendedor de la tienda A solo ve la tienda A'
);

select pruebas.entrar_como('bodega_b');
select results_eq(
  $$ select nombre from public.tiendas order by nombre $$,
  $$ values ('Tienda B') $$,
  'bodega de la tienda B no ve la tienda A'
);

select pruebas.entrar_como('admin');
select results_eq(
  $$ select nombre from public.tiendas order by nombre $$,
  $$ values ('Tienda A'), ('Tienda B') $$,
  'admin ve todas las tiendas sin tenerlas asignadas'
);

select pruebas.entrar_como('inactivo_a');
select is_empty($$ select 1 from public.tiendas $$, 'usuario inactivo no ve tiendas');

select pruebas.entrar_como('gerente_a');
select throws_ok(
  $$ insert into public.tiendas (nombre) values ('Tienda pirata') $$,
  '42501', null,
  'gerente no puede crear tiendas'
);
select results_eq(
  $$ with r as (update public.tiendas set nombre = 'Cambiada' returning 1) select count(*)::int from r $$,
  $$ values (0) $$,
  'gerente no puede editar tiendas'
);

select pruebas.entrar_como('admin');
select lives_ok(
  $$ insert into public.tiendas (nombre) values ('Tienda C') $$,
  'admin puede crear tiendas'
);
select results_eq(
  $$ with r as (delete from public.tiendas returning 1) select count(*)::int from r $$,
  $$ values (0) $$,
  'nadie borra tiendas, ni admin (se desactivan)'
);

-- ---------------------------------------------------------------------------
-- usuarios
-- ---------------------------------------------------------------------------
select pruebas.entrar_como('cajero_a');
select results_eq(
  $$ select nombre from public.usuarios $$,
  $$ values ('cajero_a') $$,
  'cajero solo ve su propia fila'
);
select results_eq(
  $$ with r as (update public.usuarios set rol = 'admin' returning 1) select count(*)::int from r $$,
  $$ values (0) $$,
  'cajero no puede cambiarse el rol'
);
select throws_ok(
  $$ insert into public.usuarios (id, nombre, rol)
     values (pruebas.id_usuario('cajero_a'), 'otro', 'admin') $$,
  '42501', null,
  'cajero no puede crear usuarios'
);

select pruebas.entrar_como('gerente_a');
select results_eq(
  $$ select nombre from public.usuarios order by nombre $$,
  $$ values ('cajero_a'), ('gerente_a'), ('inactivo_a'), ('vendedor_a') $$,
  'gerente ve a la gente de su tienda, no a la de otras ni al admin'
);
select results_eq(
  $$ with r as (update public.usuarios set activo = false
                where id = pruebas.id_usuario('cajero_a') returning 1)
     select count(*)::int from r $$,
  $$ values (0) $$,
  'gerente no puede desactivar usuarios'
);

select pruebas.entrar_como('admin');
select results_eq(
  $$ select count(*)::int from public.usuarios $$,
  $$ values (7) $$,
  'admin ve a todos los usuarios'
);
select results_eq(
  $$ with r as (update public.usuarios set rol = 'cajero'
                where id = pruebas.id_usuario('vendedor_a') returning 1)
     select count(*)::int from r $$,
  $$ values (1) $$,
  'admin puede cambiar el rol de un usuario'
);

select pruebas.entrar_como('inactivo_a');
select is_empty($$ select 1 from public.usuarios $$, 'usuario inactivo no ve ni su propia fila');

select pruebas.entrar_como_anon();
select throws_ok(
  $$ select 1 from public.usuarios $$,
  '42501', null,
  'anon no puede leer usuarios'
);

-- ---------------------------------------------------------------------------
-- usuario_tiendas
-- ---------------------------------------------------------------------------
select pruebas.entrar_como('cajero_a');
select results_eq(
  $$ select tienda_id from public.usuario_tiendas $$,
  $$ values (pruebas.id_tienda('Tienda A')) $$,
  'cajero solo ve sus propias asignaciones'
);

select pruebas.entrar_como('gerente_a');
select throws_ok(
  $$ insert into public.usuario_tiendas (usuario_id, tienda_id)
     values (pruebas.id_usuario('gerente_a'), pruebas.id_tienda('Tienda B')) $$,
  '42501', null,
  'gerente no puede asignarse otra tienda'
);
select results_eq(
  $$ with r as (delete from public.usuario_tiendas
                where usuario_id = pruebas.id_usuario('cajero_a') returning 1)
     select count(*)::int from r $$,
  $$ values (0) $$,
  'gerente no puede quitar asignaciones'
);

select pruebas.entrar_como('admin');
select lives_ok(
  $$ insert into public.usuario_tiendas (usuario_id, tienda_id)
     values (pruebas.id_usuario('cajero_a'), pruebas.id_tienda('Tienda B')) $$,
  'admin puede asignar tiendas'
);
select results_eq(
  $$ with r as (delete from public.usuario_tiendas
                where usuario_id = pruebas.id_usuario('cajero_a')
                  and tienda_id = pruebas.id_tienda('Tienda B') returning 1)
     select count(*)::int from r $$,
  $$ values (1) $$,
  'admin puede quitar asignaciones'
);

-- created_by lo pone la base: no se puede registrar a nombre de otro.
select lives_ok(
  $$ insert into public.tiendas (nombre, created_by)
     values ('Tienda D', pruebas.id_usuario('cajero_a')) $$,
  'insert con created_by ajeno no falla...'
);
reset role;
select is(
  (select created_by from public.tiendas where nombre = 'Tienda D'),
  pruebas.id_usuario('admin'),
  '...pero created_by queda con el usuario real (admin), no con el que mandó el cliente'
);

select * from finish();
rollback;
