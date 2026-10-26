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

## Comandos
| Comando | Qué hace |
| :--- | :--- |
| `npm run lint` | ESLint |
| `npm run typecheck` | Tipos de rutas + TypeScript estricto |
| `npm test` | Tests de lógica (Vitest) |
| `npm run test:db` | Tests de permisos RLS (pgTAP, necesita `db:start`) |
| `npm run db:reset` | Recrea la base local desde las migraciones |
