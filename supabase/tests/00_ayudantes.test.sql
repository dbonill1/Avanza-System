-- Ayudantes para los tests de RLS. Solo existen en la base local de pruebas
-- (este archivo no es una migración). Corre primero por el orden alfabético
-- y no hace rollback a propósito, para que los demás archivos los usen.

create extension if not exists pgtap with schema extensions;

create schema if not exists pruebas;
grant usage on schema pruebas to anon, authenticated;

-- Simula una sesión de Supabase: mismo rol y claims que manda PostgREST.
-- p_aal es el nivel de la sesión: 'aal1' = solo contraseña, 'aal2' = con 2FA.
-- Por defecto, como en la vida real: Admin con 2FA y los demás sin ella.
drop function if exists pruebas.entrar_como(text);
create or replace function pruebas.entrar_como(p_correo text, p_aal text default null)
returns void
language plpgsql
as $$
declare
  v_id uuid := pruebas.id_usuario(p_correo);
  v_aal text := coalesce(p_aal, case when pruebas.es_admin_de_prueba(v_id) then 'aal2' else 'aal1' end);
begin
  perform set_config('role', 'authenticated', true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_id, 'role', 'authenticated', 'aal', v_aal)::text,
    true
  );
end;
$$;

create or replace function pruebas.es_admin_de_prueba(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.usuarios where id = p_id and rol = 'admin')
$$;

create or replace function pruebas.entrar_como_anon()
returns void
language plpgsql
as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
end;
$$;

-- security definer: se llaman ya "dentro" de una sesión simulada, donde RLS
-- no dejaría leer auth.users ni tiendas ajenas.
create or replace function pruebas.id_usuario(p_correo text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from auth.users where email = p_correo || '@prueba.local'
$$;

create or replace function pruebas.id_tienda(p_nombre text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.tiendas where nombre = p_nombre
$$;

create or replace function pruebas.id_producto(p_sku text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.productos where sku = p_sku
$$;

create or replace function pruebas.crear_usuario(
  p_correo text,
  p_rol public.rol_usuario,
  p_tiendas text[] default '{}',
  p_activo boolean default true
)
returns uuid
language plpgsql
as $$
declare
  v_id uuid := gen_random_uuid();
  v_tienda text;
begin
  insert into auth.users (id, instance_id, aud, role, email)
  values (v_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
          p_correo || '@prueba.local');
  insert into public.usuarios (id, nombre, rol, activo)
  values (v_id, p_correo, p_rol, p_activo);
  foreach v_tienda in array p_tiendas loop
    insert into public.usuario_tiendas (usuario_id, tienda_id)
    values (v_id, pruebas.id_tienda(v_tienda));
  end loop;
  return v_id;
end;
$$;

-- Escenario común: dos tiendas, un usuario por rol, un producto con costo.
-- Primero vacía las tablas (incluido lo que cargó supabase/seed.sql) para
-- que los conteos de los tests no dependan del seed. Cada test corre en una
-- transacción con rollback, así que el seed vuelve al terminar.
create or replace function pruebas.sembrar()
returns void
language plpgsql
as $$
begin
  truncate public.usuario_tiendas, public.usuario_pines, public.producto_costos,
    public.productos, public.usuarios, public.tiendas;

  insert into public.tiendas (nombre) values ('Tienda A'), ('Tienda B');

  perform pruebas.crear_usuario('admin', 'admin');
  perform pruebas.crear_usuario('gerente_a', 'gerente', array['Tienda A']);
  perform pruebas.crear_usuario('cajero_a', 'cajero', array['Tienda A']);
  perform pruebas.crear_usuario('vendedor_a', 'vendedor', array['Tienda A']);
  perform pruebas.crear_usuario('bodega_b', 'bodega', array['Tienda B']);
  perform pruebas.crear_usuario('gerente_b', 'gerente', array['Tienda B']);
  perform pruebas.crear_usuario('inactivo_a', 'gerente', array['Tienda A'], false);

  insert into public.productos (sku, nombre, categoria, marca, precio_centavos)
  values ('FIL-001', 'Filtro de aceite', 'Filtros', 'Bosch', 25000);
  insert into public.producto_costos (producto_id, costo_promedio_centavos)
  values (pruebas.id_producto('FIL-001'), 15000);
  insert into public.usuario_pines (usuario_id, pin_hash)
  values (pruebas.id_usuario('gerente_a'), 'hash-de-prueba');
end;
$$;

grant execute on all functions in schema pruebas to anon, authenticated;

select plan(1);
select has_function('pruebas', 'sembrar', 'ayudantes de prueba instalados');
select * from finish();
