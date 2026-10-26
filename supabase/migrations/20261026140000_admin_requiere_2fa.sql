-- 2FA obligatoria para Admin, aplicada en la base de datos.
-- Una sesión de Admin que solo pasó la contraseña (aal1) no tiene permisos de
-- Admin ni ve datos: solo su propia fila de usuarios, para que la app sepa
-- que debe pedirle el código. Con el código de la app autenticadora (aal2)
-- recupera todos sus permisos. Los demás roles no cambian.

-- ¿La sesión actual tiene el nivel que su rol exige?
create function privado.nivel_suficiente()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select privado.rol_actual() is distinct from 'admin'
    or coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
$$;

create or replace function privado.usuario_activo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select privado.rol_actual() is not null and privado.nivel_suficiente()
$$;

create or replace function privado.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(privado.rol_actual() = 'admin', false) and privado.nivel_suficiente()
$$;

create or replace function privado.es_gerente_o_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(privado.rol_actual() = 'gerente', false) or privado.es_admin()
$$;

revoke all on function privado.nivel_suficiente() from public;
grant execute on function privado.nivel_suficiente() to authenticated;

-- La fila propia (y las asignaciones propias) se ven con solo estar activo,
-- sin importar el nivel: la app la necesita para saber que es Admin y
-- mandarlo a la pantalla del código.
drop policy "usuarios: ver el propio, los de mis tiendas (gerente) o todos (admin)"
  on public.usuarios;
create policy "usuarios: ver el propio, los de mis tiendas (gerente) o todos (admin)"
  on public.usuarios for select to authenticated
  using (
    (id = (select auth.uid()) and (select privado.rol_actual()) is not null)
    or (select privado.es_admin())
    or privado.es_gerente_de(id)
  );

drop policy "usuario_tiendas: ver las propias o todas (admin)"
  on public.usuario_tiendas;
create policy "usuario_tiendas: ver las propias o todas (admin)"
  on public.usuario_tiendas for select to authenticated
  using (
    (usuario_id = (select auth.uid()) and (select privado.rol_actual()) is not null)
    or (select privado.es_admin())
  );
