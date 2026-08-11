# ProjectForge

ProjectForge is a production-oriented Next.js planning workspace for teams to define software requirements, architecture, APIs, database models, delivery tasks, and launch readiness before implementation begins.

## Production readiness status

The workspace is now wired for real authenticated, database-backed project data. Dashboard and project routes call protected API routes, API routes validate Supabase bearer tokens, and persistence is handled through Prisma/PostgreSQL. Local development may opt into a clearly marked auth bypass with `ENABLE_DEV_AUTH=true`; never enable that flag in production.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS design tokens and reusable UI primitives
- TanStack Query for caching, retries, loading states, and mutations
- React Hook Form and Zod for form state and validation
- Supabase Auth for registration, login, password recovery, and JWT validation
- Prisma with PostgreSQL persistence
- Recharts and Lucide for workspace charts and icons

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

For local API testing without Supabase, set `ENABLE_DEV_AUTH=true` in `.env.local`. Production deployments must leave it unset or `false`.

## Quality gates

```bash
npm run lint
npm run typecheck
npm run build
```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma migrations and API routes. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public Supabase project URL used by browser auth and server token validation. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public Supabase anon key used by browser auth and server token validation. |
| `ENABLE_DEV_AUTH` | Development only | Optional local API auth bypass. Must be `false` or unset in production. |

## Folder structure

```text
src/app                 App Router pages, API routes, metadata, loading, error, not-found boundaries
src/components          Shared UI, feedback, marketing, and workspace components
src/features/projects   Project feature types, query keys, and browser API repository
src/data                User-facing copy and static marketing taxonomy only
src/lib                 Auth, environment, Prisma, Supabase, schemas, utilities
prisma                  Database schema and migrations
```

## Database and migrations

The Prisma schema includes normalized project planning entities with cascading deletes, uniqueness constraints, and indexes for owner/status/priority/read queries. Apply migrations in production with:

```bash
npx prisma migrate deploy
```

For local schema iteration:

```bash
npx prisma migrate dev
```

## Deployment checklist

1. Provision PostgreSQL and set `DATABASE_URL`.
2. Provision Supabase Auth and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Run `npx prisma migrate deploy` during deployment or release promotion.
4. Verify `/api/health` returns `{ "status": "ok" }` after deployment.
5. Keep `ENABLE_DEV_AUTH` disabled in production.

## Security notes

- All project API routes require an authenticated Supabase bearer token unless the local-only dev bypass is explicitly enabled outside production.
- Project reads/writes are scoped by authenticated `ownerId`.
- Mutation payloads are validated with Zod before persistence.
- Service-role credentials are intentionally not used by browser code.
