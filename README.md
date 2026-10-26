# Avanza-System
Sistema de manejo de inventario y caja para Avanza Autopartes.

Especificación: [docs/especificacion.md](docs/especificacion.md)

## Requisitos
- Node 22 (ver `.nvmrc`)
- Docker Desktop u OrbStack, para correr Supabase local

## Arrancar en local
```bash
npm install
npm run db:start          # levanta Supabase local e imprime URL y keys
cp .env.example .env.local # llenar con las keys que imprimió db:start
npm run dev
```

La base local trae usuarios de prueba (uno por rol) y tres tiendas: ver
`supabase/seed.sql`, que también tiene la contraseña de prueba. El seed solo
se carga en local; nunca llega a staging ni producción.

## Comandos
| Comando | Qué hace |
| :--- | :--- |
| `npm run lint` | ESLint |
| `npm run typecheck` | Tipos de rutas + TypeScript estricto |
| `npm test` | Tests de lógica (Vitest) |
| `npm run test:db` | Tests de permisos RLS (pgTAP, necesita `db:start`) |
| `npm run db:reset` | Recrea la base local desde las migraciones |
| `npm run db:tipos` | Regenera `src/types/base-datos.ts` desde la base local |

## CI
`.github/workflows/ci.yml` corre en cada push y PR:
- **app:** lint, typecheck, tests de Vitest y build.
- **base-de-datos:** levanta Postgres, aplica las migraciones, corre los tests
  RLS y falla si `src/types/base-datos.ts` no coincide con las migraciones.

## Staging (pendiente)
Cuando exista el proyecto de Supabase de staging:
1. `npx supabase link --project-ref <ref>`
2. `npx supabase db push` (aplica las migraciones)
3. `npx supabase config push` (Auth: sin registro público, contraseñas fuertes, TOTP)
4. En Vercel, variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   y `SUPABASE_SECRET_KEY` del proyecto de staging.
