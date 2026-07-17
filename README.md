# ProjectForge

ProjectForge is a production-oriented Next.js planning workspace for teams to define software requirements, architecture, APIs, database models, delivery tasks, and launch readiness before implementation begins.

## Production readiness status

This repository is structured to run as a polished frontend with a browser-backed repository while the hosted API/Supabase integration is connected. The data layer is isolated behind feature repositories so the local implementation can be replaced by server actions or route handlers without rewriting page components.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS design tokens and reusable UI primitives
- TanStack Query for caching, retries, loading states, and mutations
- React Hook Form and Zod for form state and validation
- Prisma schema for PostgreSQL persistence
- Framer Motion, Recharts, and Lucide for interaction, charts, and icons

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality gates

```bash
npm run lint
npm run typecheck
npm run build
```

## Environment variables

Create `.env.local` for local development and configure production secrets in your deployment platform.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Required for Prisma migrations/API persistence | PostgreSQL connection string used by Prisma. |
| `NEXT_PUBLIC_SUPABASE_URL` | Required when Supabase auth is enabled | Public Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required when Supabase auth is enabled | Public Supabase anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only when admin operations are enabled | Service role key. Never expose to the browser. |

## Folder structure

```text
src/app                 App Router routes, metadata, loading, error, and not-found boundaries
src/components          Shared UI, feedback, marketing, and workspace components
src/features/projects   Project feature types, query keys, repository, and mutations
src/data                Centralized content and legacy static planning taxonomies
src/lib                 Cross-cutting schemas and utilities
prisma                  Database schema and migrations
```

## Architecture notes

- UI components do not read storage directly. Project data access is contained in `src/features/projects/project-repository.ts`.
- TanStack Query query keys and mutations live in `src/features/projects/queries.ts` to keep server-state behavior consistent.
- User-facing copy and route constants live in `src/data/content.ts` to reduce hardcoded strings in route components.
- Global feedback is provided through `ToastProvider`, and destructive actions require confirmation dialogs.
- Error, loading, and not-found boundaries are defined at the app level for graceful fallbacks.

## Database and migrations

The Prisma schema includes normalized project planning entities with cascading deletes, uniqueness constraints, and indexes for owner/status/priority/read queries. Apply migrations with:

```bash
npx prisma migrate deploy
```

For local schema iteration:

```bash
npx prisma migrate dev
```

## Security checklist

- Validate all form and mutation payloads with Zod before persistence.
- Keep service role keys server-only.
- Add route middleware and Supabase session validation before enabling customer data.
- Add server-side authorization checks for every project by `ownerId`.
- Add API rate limiting for auth and AI-generation endpoints.
- Continue relying on React escaping for rendered text and avoid `dangerouslySetInnerHTML` for user content.

## Known follow-up work

- Replace the browser-backed repository with authenticated server-side persistence.
- Add role-based workspace memberships when organizations are introduced.
- Add integration/e2e tests once the API contract is finalized.
