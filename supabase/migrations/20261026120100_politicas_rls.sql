-- Políticas RLS de la Fase 1. Regla general:
--   * Sin política de DELETE = nadie borra (se desactiva con activa/activo).
--     Excepción: Admin puede quitar asignaciones en usuario_tiendas.
--   * usuario_pines no tiene políticas a propósito: solo el servidor la usa.
--   * (select privado.f()) en vez de privado.f() hace que Postgres evalúe la
--     función una vez por consulta y no una vez por fila.

-- ---------------------------------------------------------------------------
-- tiendas: cada quien ve las tiendas que tiene asignadas; Admin ve todas.
-- ---------------------------------------------------------------------------
create policy "tiendas: ver las asignadas"
  on public.tiendas for select to authenticated
  using ((select privado.es_admin()) or privado.tiene_tienda(id));

create policy "tiendas: admin crea"
  on public.tiendas for insert to authenticated
  with check ((select privado.es_admin()));

create policy "tiendas: admin edita"
  on public.tiendas for update to authenticated
  using ((select privado.es_admin()))
  with check ((select privado.es_admin()));

-- ---------------------------------------------------------------------------
-- usuarios: cada quien ve su fila; el gerente ve a la gente de sus tiendas;
-- Admin ve y edita todo. Nadie más edita: así nadie se cambia su propio rol.
-- ---------------------------------------------------------------------------
create policy "usuarios: ver el propio, los de mis tiendas (gerente) o todos (admin)"
  on public.usuarios for select to authenticated
  using (
    (id = (select auth.uid()) and (select privado.usuario_activo()))
    or (select privado.es_admin())
    or privado.es_gerente_de(id)
  );

create policy "usuarios: admin crea"
  on public.usuarios for insert to authenticated
  with check ((select privado.es_admin()));

create policy "usuarios: admin edita"
  on public.usuarios for update to authenticated
  using ((select privado.es_admin()))
  with check ((select privado.es_admin()));

-- ---------------------------------------------------------------------------
-- usuario_tiendas: cada quien ve sus asignaciones; solo Admin asigna y quita.
-- ---------------------------------------------------------------------------
create policy "usuario_tiendas: ver las propias o todas (admin)"
  on public.usuario_tiendas for select to authenticated
  using (
    (usuario_id = (select auth.uid()) and (select privado.usuario_activo()))
    or (select privado.es_admin())
  );

create policy "usuario_tiendas: admin asigna"
  on public.usuario_tiendas for insert to authenticated
  with check ((select privado.es_admin()));

create policy "usuario_tiendas: admin quita"
  on public.usuario_tiendas for delete to authenticated
  using ((select privado.es_admin()));

-- ---------------------------------------------------------------------------
-- productos: el catálogo es común a las tres tiendas; lo ve cualquier usuario
-- activo y solo Admin cambia precios.
-- ---------------------------------------------------------------------------
create policy "productos: usuarios activos ven el catálogo"
  on public.productos for select to authenticated
  using ((select privado.usuario_activo()));

create policy "productos: admin crea"
  on public.productos for insert to authenticated
  with check ((select privado.es_admin()));

create policy "productos: admin edita"
  on public.productos for update to authenticated
  using ((select privado.es_admin()))
  with check ((select privado.es_admin()));

-- ---------------------------------------------------------------------------
-- producto_costos: solo Gerente y Admin ven costos; solo Admin los cambia.
-- ---------------------------------------------------------------------------
create policy "producto_costos: gerente y admin ven costos"
  on public.producto_costos for select to authenticated
  using ((select privado.es_gerente_o_admin()));

create policy "producto_costos: admin crea"
  on public.producto_costos for insert to authenticated
  with check ((select privado.es_admin()));

create policy "producto_costos: admin edita"
  on public.producto_costos for update to authenticated
  using ((select privado.es_admin()))
  with check ((select privado.es_admin()));
