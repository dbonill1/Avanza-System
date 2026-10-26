-- Reglas que aplican a TODAS las tablas de public, incluidas las futuras.
-- Si alguien agrega una tabla sin RLS o sin columnas de auditoría, esto falla.
begin;
select plan(5);

select is_empty(
  $$ select c.relname::text
     from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity $$,
  'toda tabla de public tiene RLS activado (regla 5 de CLAUDE.md)'
);

select is_empty(
  $$ select t.table_name::text
     from information_schema.tables t
     where t.table_schema = 'public' and t.table_type = 'BASE TABLE'
       and (select count(*) from information_schema.columns c
            where c.table_schema = 'public' and c.table_name = t.table_name
              and c.column_name in ('id', 'created_at', 'created_by')) < 3 $$,
  'toda tabla de public tiene id, created_at y created_by'
);

select is_empty(
  $$ select table_name::text from information_schema.role_table_grants
     where grantee = 'anon' and table_schema = 'public' $$,
  'anon no tiene ningún privilegio sobre tablas de public'
);

select is_empty(
  $$ select table_name::text from information_schema.role_table_grants
     where grantee = 'authenticated' and table_schema = 'public'
       and privilege_type = 'TRUNCATE' $$,
  'authenticated no puede hacer TRUNCATE (TRUNCATE se salta RLS)'
);

select is_empty(
  $$ select c.table_name::text || '.' || c.column_name::text
     from information_schema.columns c
     where c.table_schema = 'public' and c.column_name like '%centavos'
       and c.data_type <> 'bigint' $$,
  'todo monto en centavos es bigint (regla 1 de CLAUDE.md)'
);

select * from finish();
rollback;
