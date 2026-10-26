-- Datos de prueba SOLO para la base local (`npm run db:reset` / `db:start`).
-- `supabase db push` no aplica este archivo: nunca llega a staging ni producción.
--
-- Todos los usuarios usan la contraseña de prueba:  Avanza-Prueba-2026
--
--   admin@avanza.test       admin     (ve todas las tiendas)
--   gerente1@avanza.test    gerente   Tienda 1
--   cajero1@avanza.test     cajero    Tienda 1
--   vendedor1@avanza.test   vendedor  Tienda 1
--   bodega2@avanza.test     bodega    Tienda 2
--   inactivo@avanza.test    cajero    Tienda 1, desactivado (no debe poder entrar)

insert into public.tiendas (nombre, direccion) values
  ('Tienda 1', '[Dirección de la tienda 1]'),
  ('Tienda 2', '[Dirección de la tienda 2]'),
  ('Tienda 3', '[Dirección de la tienda 3]');

do $$
declare
  u record;
  v_id uuid;
begin
  for u in
    select * from (values
      ('admin@avanza.test', 'Administrador de prueba', 'admin'::public.rol_usuario, null::text, true),
      ('gerente1@avanza.test', 'Gerente de prueba', 'gerente', 'Tienda 1', true),
      ('cajero1@avanza.test', 'Cajero de prueba', 'cajero', 'Tienda 1', true),
      ('vendedor1@avanza.test', 'Vendedor de prueba', 'vendedor', 'Tienda 1', true),
      ('bodega2@avanza.test', 'Bodega de prueba', 'bodega', 'Tienda 2', true),
      ('inactivo@avanza.test', 'Usuario desactivado', 'cajero', 'Tienda 1', false)
    ) as t(correo, nombre, rol, tienda, activo)
  loop
    v_id := gen_random_uuid();

    -- Las columnas de texto vacías ('') evitan errores de GoTrue al leer NULL.
    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      v_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', u.correo,
      extensions.crypt('Avanza-Prueba-2026', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now(),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_id, v_id::text, 'email',
      jsonb_build_object('sub', v_id::text, 'email', u.correo, 'email_verified', true),
      now(), now(), now()
    );

    insert into public.usuarios (id, nombre, rol, activo) values (v_id, u.nombre, u.rol, u.activo);

    if u.tienda is not null then
      insert into public.usuario_tiendas (usuario_id, tienda_id)
      select v_id, id from public.tiendas where nombre = u.tienda;
    end if;
  end loop;
end;
$$;
