-- Fase 1: tiendas, usuarios, usuario_tiendas, usuario_pines, productos, producto_costos.
-- Las políticas RLS están en la migración siguiente; aquí cada tabla nace con
-- RLS activado (sin políticas = nadie con rol authenticated/anon ve nada).

-- ---------------------------------------------------------------------------
-- Privilegios por defecto
-- ---------------------------------------------------------------------------
-- anon no tiene nada que hacer en public: el login usa el esquema auth.
-- TRUNCATE no respeta RLS, así que tampoco se le da a authenticated.
alter default privileges for role postgres in schema public
  revoke all on tables from anon;
alter default privileges for role postgres in schema public
  revoke truncate, references, trigger on tables from authenticated;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.rol_usuario as enum ('vendedor', 'cajero', 'bodega', 'gerente', 'admin');

-- ---------------------------------------------------------------------------
-- Esquema privado: funciones de apoyo. La API (PostgREST) no lo expone.
-- ---------------------------------------------------------------------------
create schema privado;
revoke all on schema privado from public;
-- authenticated necesita USAGE para que las políticas puedan llamar estas funciones.
grant usage on schema privado to authenticated;

-- created_by y created_at los pone la base, no el cliente: nadie puede
-- registrar una fila a nombre de otro usuario ni cambiar la fecha.
create function privado.fijar_auditoria()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.created_at := now();
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------
create table public.tiendas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique check (length(trim(nombre)) > 0),
  direccion text,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

-- id = auth.users.id: un usuario de la app es una cuenta de Supabase Auth.
create table public.usuarios (
  id uuid primary key references auth.users (id) on delete restrict,
  nombre text not null check (length(trim(nombre)) > 0),
  rol public.rol_usuario not null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

-- Separada de usuarios porque RLS filtra filas, no columnas: el hash del PIN
-- no debe llegar a ningún cliente. Solo el servidor (secret key) la usa.
create table public.usuario_pines (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references public.usuarios (id) on delete restrict,
  pin_hash text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

create table public.usuario_tiendas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete restrict,
  tienda_id uuid not null references public.tiendas (id) on delete restrict,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  unique (usuario_id, tienda_id)
);
create index usuario_tiendas_tienda_id_idx on public.usuario_tiendas (tienda_id);

create table public.productos (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique check (length(trim(sku)) > 0 and sku = trim(sku)),
  nombre text not null check (length(trim(nombre)) > 0),
  categoria text,
  marca text,
  precio_centavos bigint not null check (precio_centavos >= 0),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

-- Separada de productos: solo Gerente y Admin ven costos (ver usuario_pines).
create table public.producto_costos (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null unique references public.productos (id) on delete restrict,
  costo_promedio_centavos bigint not null check (costo_promedio_centavos >= 0),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

-- RLS, triggers de auditoría y privilegios, iguales para las seis tablas.
do $$
declare
  tabla text;
begin
  foreach tabla in array array[
    'tiendas', 'usuarios', 'usuario_pines', 'usuario_tiendas', 'productos', 'producto_costos'
  ] loop
    execute format('alter table public.%I enable row level security', tabla);
    execute format(
      'create trigger fijar_auditoria before insert or update on public.%I
         for each row execute function privado.fijar_auditoria()',
      tabla
    );
    execute format('revoke all on public.%I from anon', tabla);
    execute format('revoke truncate, references, trigger on public.%I from authenticated', tabla);
  end loop;
end;
$$;

-- Ni siquiera Admin lee PINs desde la app: solo el servidor con la secret key.
revoke all on public.usuario_pines from authenticated;

-- ---------------------------------------------------------------------------
-- Funciones de permisos para las políticas
-- security definer: leen usuarios/usuario_tiendas sin pasar por su RLS
-- (si no, las políticas de esas tablas se llamarían a sí mismas).
-- Un usuario inactivo no tiene rol ni tiendas: pierde todo acceso.
-- ---------------------------------------------------------------------------
create function privado.rol_actual()
returns public.rol_usuario
language sql
stable
security definer
set search_path = ''
as $$
  select u.rol
  from public.usuarios u
  where u.id = auth.uid() and u.activo
$$;

create function privado.usuario_activo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select privado.rol_actual() is not null
$$;

create function privado.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(privado.rol_actual() = 'admin', false)
$$;

create function privado.es_gerente_o_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(privado.rol_actual() in ('gerente', 'admin'), false)
$$;

create function privado.tiene_tienda(p_tienda_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select privado.usuario_activo() and exists (
    select 1
    from public.usuario_tiendas ut
    where ut.usuario_id = auth.uid() and ut.tienda_id = p_tienda_id
  )
$$;

-- ¿El usuario actual es gerente de alguna tienda donde trabaja p_usuario_id?
create function privado.es_gerente_de(p_usuario_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(privado.rol_actual() = 'gerente', false) and exists (
    select 1
    from public.usuario_tiendas mia
    join public.usuario_tiendas suya on suya.tienda_id = mia.tienda_id
    where mia.usuario_id = auth.uid() and suya.usuario_id = p_usuario_id
  )
$$;

revoke all on all functions in schema privado from public;
grant execute on function
  privado.rol_actual(),
  privado.usuario_activo(),
  privado.es_admin(),
  privado.es_gerente_o_admin(),
  privado.tiene_tienda(uuid),
  privado.es_gerente_de(uuid)
to authenticated;
