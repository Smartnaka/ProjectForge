# ProjectForge Production Backend & Database Implementation Guide

## 0. Scope and non-goals

This guide tracks the production backend implementation now present in the repository. The current codebase is a Next.js App Router application with Supabase authentication, protected API route handlers, Prisma/PostgreSQL persistence, and database-backed project dashboard/detail flows. Remaining sections identify future module expansion work beyond the implemented project foundation.

## 1. Existing project analysis

### 1.1 Project structure

```text
src/app/                         Next.js App Router pages and route-level boundaries
src/app/auth/*/page.tsx          Login, registration, forgot-password pages
src/app/dashboard/page.tsx       Dashboard page wrapper
src/app/projects/[id]/page.tsx   Project detail page wrapper; passes id into the workspace query
src/components/marketing         Landing page UI
src/components/workspace         Auth, dashboard, project workspace UI
src/components/ui                Button, card, input, skeleton, empty state primitives
src/components/feedback          Toast and confirm dialog components
src/features/projects            Project types, TanStack Query keys, browser repository
src/data                         Copy plus demo/static arrays
src/lib                          Zod schemas and utilities
prisma                           Prisma schema and migration SQL
```

### 1.2 Frameworks and libraries

- Next.js App Router with React and TypeScript.
- Tailwind CSS v4 through `@tailwindcss/postcss`.
- TanStack Query is configured globally in `src/components/providers.tsx`, but only the project repository abstraction is prepared to use it.
- React Hook Form is used in auth forms.
- Zod validates auth and project creation forms in `src/lib/schemas.ts`.
- Prisma and `@prisma/client` are installed, generated during install/build, and used by protected API route handlers through `src/lib/prisma.ts`.
- Supabase client utilities are implemented for browser authentication and server-side bearer token validation.
- Recharts powers the dashboard chart.
- Framer Motion powers landing/project animations.
- Vercel is the implied deployment target through `vercel.json`.

### 1.3 Current backend/API architecture

Implemented API route handlers exist for health checks and project list/create/detail/archive operations. Runtime project CRUD behavior now goes through `src/features/projects/project-repository.ts`, which calls authenticated internal APIs instead of localStorage.

### 1.4 Existing database code

`prisma/schema.prisma` defines a PostgreSQL data model for users, projects, tags, discovery, requirements, user stories, features, database tables/columns, API endpoints, tasks, documents, notes, and notifications. `prisma.config.ts` points Prisma at `DATABASE_URL`, falling back to `postgresql://postgres:postgres@localhost:5432/projectforge`. The production readiness migration is a full initial PostgreSQL migration generated from the Prisma schema, including tables, enums, constraints, indexes, and foreign keys.

### 1.5 Authentication and authorization

The auth pages render `AuthCard`, which calls Supabase sign-up, sign-in, and password-reset APIs. API authorization is enforced by validating Supabase bearer tokens in `requireUser`; local development can opt into `ENABLE_DEV_AUTH=true`.

### 1.6 State management and data flow

`src/components/providers.tsx` creates a TanStack `QueryClient` with a 30-second stale time. `src/features/projects/queries.ts` defines query keys and mutations. The repository functions are asynchronous browser API clients that attach Supabase bearer tokens and call protected internal route handlers.

### 1.7 Configuration and deployment

- `package.json` defines `dev`, `build`, `start`, `lint`, and `typecheck`; there is no test script.
- `next.config.ts` enables server actions body size limit but no server actions currently exist.
- `vercel.json` declares Next.js and `.next` output.
- `.env.example` documents required PostgreSQL, Supabase, and local development auth variables.

## 2. What the application currently does, feature by feature

### Feature: Landing page

Current implementation: User visits `/`. `src/app/page.tsx` renders `LandingPage`. The landing page shows marketing navigation, feature cards, process cards, pricing copy, and a readiness preview.

Current data source: `src/data/content.ts` supplies copy/routes/preview text. `src/data/mock.ts` supplies marketing feature card definitions and icons.

Backend/API: none.

Data created/read/updated/deleted: none.

Problems: The secondary CTA is labeled `View demo` and sends users to `/dashboard`, which currently shows fake projects. The preview hardcodes `Atlas CRM readiness` and `82%`.

Production implementation: Keep marketing copy static, but remove demo-specific labels and make CTA behavior explicit: unauthenticated users should go to login/register; authenticated users may go to dashboard. The preview may remain as illustrative marketing content if labeled as a product example, not user data.

Backend requirements: optional `/api/session` or Supabase session read to decide CTA target.

Database requirements: none.

API requirements: none required for static landing page.

### Feature: Authentication screens

Current implementation: `/auth/login`, `/auth/register`, and `/auth/forgot-password` render `AuthCard`. The form validates email/password syntax with Zod via React Hook Form. Submit does not authenticate; it routes to dashboard or login.

Current data source: form inputs only; no persisted user/session.

Backend/API: none.

Data created/read/updated/deleted: none.

Problems: Authentication is fake. Users can access `/dashboard` without credentials. Password reset does not send email. Supabase dependency and README variables are not used.

Production implementation: Use Supabase Auth on the client for sign-up, sign-in, sign-out, email verification, password recovery, and session persistence. Add middleware or route guards for protected pages. Add server-side session validation for all API routes. Mirror Supabase users into `User` records through a server-side upsert when a valid token is first used.

Backend requirements: auth utility to validate bearer token/cookies, user provisioning service, middleware for protected API routes.

Database requirements: `User` table linked to Supabase user id.

API requirements: internal API routes should require a session; auth forms can call Supabase directly unless custom audit logging is required.

### Feature: Dashboard

Current implementation: `/dashboard` renders `Dashboard`. It displays hardcoded stats from `dashboardCopy.stats`, recent project cards from `sampleProjects`, a Recharts bar chart using sample scores, a checklist from `checklist`, and an activity string from `dashboardCopy.activitySummary`. The create button routes to `routes.demoProject` (`/projects/atlas`).

Current data source: `src/data/content.ts` and `src/data/mock.ts`.

Backend/API: none.

Data created/read/updated/deleted: none from this component. It imports no project query/mutation despite those existing.

Problems: All dashboard data is static. Actions are icons only and do not mutate. Search is display-only text. The create button opens a hardcoded project id. No loading, unauthorized, session-expired, or database-error states exist.

Production implementation: Dashboard should call `projectQueries.list(filters)` which should fetch `/api/projects`. Stats should be computed from database-backed results or returned from `/api/dashboard/summary`. Search should update filters with debounce. Create should open a validated create project form and call `POST /api/projects`. Archive/delete/favorite should call mutations. Empty state should prompt project creation.

Backend requirements: project list endpoint, dashboard summary endpoint or aggregate service, create/update/archive endpoints, owner scoping.

Database requirements: `Project`, `Tag`, and aggregate counts over child entities.

API requirements: `GET /api/projects`, `POST /api/projects`, `PATCH /api/projects/:id`, `DELETE /api/projects/:id` or archive endpoint, optional `GET /api/dashboard/summary`.

### Feature: Project detail workspace

Current implementation: `/projects/[id]` renders `ProjectShell`, but the page ignores the route parameter. `ProjectShell` always displays `projectCopy` for Atlas CRM, `projectNav`, `stack`, `aiActions`, `securityItems`, and `perfItems` from static data.

Current data source: `src/data/content.ts` and `src/data/mock.ts`.

Backend/API: none.

Data created/read/updated/deleted: none.

Problems: Dynamic route is not dynamic. Any `/projects/*` path shows the same Atlas CRM data. Planning sections are read-only hardcoded cards. AI actions are labels only. Documentation text is static.

Production implementation: Read `params.id`, fetch `GET /api/projects/:id`, and render project-owned artifacts. Each nav section should map to real child collections: discovery, requirements, stories, features, architecture decisions, database tables/columns, API endpoints, UI planning, tasks, testing, security, performance, deployment, documents, release checklist, notes, assistant jobs, and settings. Initially implement project overview and CRUD for core tables before advanced modules.

Backend requirements: detail endpoint and child CRUD endpoints.

Database requirements: all project child tables already represented in Prisma, with timestamps added.

API requirements: project detail endpoint and endpoints for discovery, requirements, stories, features, tables/columns, endpoints, tasks, docs, notes.

### Feature: Project repository abstraction

Current implementation: `src/features/projects/project-repository.ts` exposes `listProjects`, `getProject`, `createProject`, and `archiveProject`. It validates creates with Zod, delays by 250ms, reads/writes localStorage, and seeds three projects.

Current data source: browser `localStorage`, falling back to in-memory constants.

Backend/API: none.

Data created/read/updated/deleted: browser-local only.

Problems: Data is per browser, unauthenticated, not backed up, not shareable, not secure, and not available to server rendering. Artificial network delay masks real behavior. Seed data mixes demo with data access code.

Production implementation: Keep the exported function names but replace internals with `fetch` calls to authenticated route handlers. Move persistence logic to server repositories/services. Put dev/test seeds in `prisma/seed.ts` or test fixtures only.

Backend requirements: all project repository operations require API endpoints.

Database requirements: `Project` and related tables.

API requirements: same as dashboard/project detail.

### Feature: Global providers and feedback

Current implementation: Providers wrap app with theme, TanStack Query, and toast provider. Toasts are local UI notifications only. ConfirmDialog exists but dashboard does not use it.

Current data source: component state.

Backend/API: none.

Problems: Destructive actions are not wired. Toast provider uses `crypto.randomUUID`, which is fine in modern browsers but should be tested in target browsers.

Production implementation: Keep providers. Use toasts for API success/failure. Use confirm dialog for archive/delete. Configure query retry behavior per endpoint. Optionally add React Query Devtools only in development.

## 3. Complete demo/mock inventory

| Location | Current behavior | Why not production-suitable | Replacement | DB/API changes required |
| --- | --- | --- | --- | --- |
| `src/features/projects/project-repository.ts` API calls | Calls protected internal project APIs with Supabase bearer tokens. | Production-ready foundation. | Expand with update/favorite/child-artifact endpoints. | Additional `PATCH` and child CRUD APIs. |
| Project persistence | Persists projects in PostgreSQL through Prisma. | Production-ready foundation. | Add module-level CRUD and collaboration later. | Child artifact APIs and future workspace membership tables. |
| `networkDelayMs` and `delay()` | Simulates API latency. | Misrepresents real network/database failures. | Real fetch latency and TanStack loading/error states. | None beyond API implementation. |
| `src/data/mock.ts` `sampleProjects` | Dashboard sample cards. | Fake projects and scores. | Database-backed project list. | `GET /api/projects`, optional summary aggregates. |
| `src/data/mock.ts` `checklist` | Static progress checklist. | Not tied to actual artifacts. | Computed readiness based on persisted section completion. | Query counts/completion states from child tables. |
| `src/data/mock.ts` `projectNav`, `aiActions`, `stack`, `securityItems`, `perfItems` | Project shell static modules/actions/labels. | Some are taxonomy, some imply features that do not exist. | Keep taxonomy constants in named production copy file; wire actions to real endpoints only when implemented. | Child CRUD endpoints; future AI job endpoints if AI is added. |
| `src/data/content.ts` `routes.demoProject` | Hardcoded `/projects/atlas`. | Project id may not exist and bypasses creation. | Route created project ids from API responses. | `POST /api/projects` returns id. |
| `src/data/content.ts` preview and project copy | Hardcoded Atlas CRM and 82% readiness. | Looks like real workspace data but is static. | Marketing example clearly labeled, or remove from app shell. | None for marketing; real project data for workspace. |
| `src/components/workspace/auth-card.tsx` submit handler | Redirects without auth. | Any user can access app. | Supabase Auth calls and protected routes. | Auth middleware/server validation; `User` upsert. |
| `src/components/workspace/dashboard.tsx` stats/activity | Static counts and activity. | Incorrect for real users. | Derived from database. | Summary endpoint or aggregate queries. |
| `src/components/workspace/dashboard.tsx` action icons | Icons do nothing. | Misleading UI. | Wire favorite, duplicate, archive, delete with confirmations or remove until ready. | `PATCH/POST/DELETE` endpoints. |
| `src/app/projects/[id]/page.tsx` | Ignores `id`. | Dynamic route always displays same content. | Pass `params.id` to data fetch. | `GET /api/projects/:id`. |
| README known follow-ups | Says API/Supabase not connected. | Accurate but confirms production gap. | Update only after implementation. | Documentation update. |
| `prisma.config.ts` default DB URL | Uses default local credentials. | Fine for dev but dangerous if treated as prod default. | Keep only for local, document required `DATABASE_URL`; fail fast in production if missing. | Env validation. |

No fake credentials, sample transactions, file placeholders, upload mocks, or seed scripts were found. There are no tests. The `TODO` string appears as a `WorkStatus` enum value, not a code TODO.

## 4. Production architecture design

Use the architecture in `ARCHITECTURE.md`. Recommended components:

- Frontend: existing Next.js App Router pages and client components.
- Backend/API: Next.js route handlers under `src/app/api`.
- Business logic: `src/server/services`.
- Database access: `src/server/repositories` with Prisma.
- Database: managed PostgreSQL.
- Authentication: Supabase Auth because dependency and README variables already exist.
- Authorization: owner-scoped checks on every project query/mutation.
- File storage: not required today; add Supabase Storage only when avatars/document uploads are implemented.
- Background jobs: not required for current features. Add a queue only for future AI/document generation or scheduled notifications.
- Email: Supabase Auth transactional emails for verification/password reset.
- Caching: TanStack Query client cache; no distributed cache initially.
- Logging/monitoring: hosting logs, structured API logs, Sentry or equivalent error tracking, uptime checks on health endpoint.
- Deployment: Vercel for Next.js plus managed PostgreSQL and Supabase.
- CI/CD: GitHub Actions or Vercel checks running lint, typecheck, tests, build, and migration checks.

## 5. Backend implementation plan

Recommended structure:

```text
src/app/api/projects/route.ts
src/app/api/projects/[projectId]/route.ts
src/app/api/projects/[projectId]/discovery/route.ts
src/app/api/projects/[projectId]/requirements/route.ts
src/app/api/projects/[projectId]/requirements/[requirementId]/route.ts
src/app/api/projects/[projectId]/stories/route.ts
src/app/api/projects/[projectId]/features/route.ts
src/app/api/projects/[projectId]/api-endpoints/route.ts
src/app/api/projects/[projectId]/database-tables/route.ts
src/app/api/projects/[projectId]/tasks/route.ts
src/app/api/projects/[projectId]/documents/route.ts
src/app/api/projects/[projectId]/notes/route.ts
src/app/api/dashboard/summary/route.ts
src/app/api/health/route.ts
src/server/auth/session.ts
src/server/http/errors.ts
src/server/http/rate-limit.ts
src/server/repositories/project-repository.ts
src/server/repositories/artifact-repository.ts
src/server/services/project-service.ts
src/server/services/readiness-service.ts
src/server/services/user-service.ts
src/server/db/prisma.ts
src/server/config/env.ts
src/features/projects/api-client.ts
src/features/projects/schemas.ts
```

Layer responsibilities:

- API routes parse HTTP requests, call `requireSession`, validate request data, invoke services, and return consistent JSON.
- Services enforce business rules such as unique names, readiness scoring, ownership, archive restrictions, and transaction boundaries.
- Repositories contain Prisma queries only; they should not know about HTTP.
- Validators define Zod schemas shared by client forms and API routes.
- Auth/session utilities validate Supabase sessions and return the app `User`.
- Error utilities map domain errors to stable HTTP status codes.

## 6. Database design

Use `DATABASE_SCHEMA.md` as the table-by-table source of truth. The existing Prisma schema is close to the needed production shape but requires these changes before implementation:

1. Add timestamps to all editable child entities.
2. Create a complete initial migration if the existing migration does not create all tables from scratch.
3. Resolve enum mismatch between UI `ProjectStatus` and Prisma `ProjectStatus`.
4. Decide whether to normalize architecture, testing, security, performance, deployment, and release checklist into additional tables or store them initially as `Document`/`Task` records. Recommendation: start with existing `Document` and `Task` models, then normalize after product usage proves the need.
5. Add optional `metadata` JSON columns only where needed; avoid catch-all JSON for core entities that need filtering.

## 7. Database relationships

See `DATABASE_SCHEMA.md` for ERD. Current required relationships:

- `User` one-to-many `Project`: each project has one owner; owners can have many projects.
- `User` one-to-many `Notification`: notifications are delivered to a specific user.
- `Project` one-to-one `Discovery`: each project has one structured discovery record.
- `Project` one-to-many child artifacts: requirements, stories, features, API endpoints, database tables, tasks, documents, notes, tags.
- `DbTable` one-to-many `DbColumn`: a planned database table contains columns.

Future organizations would introduce `Workspace`, `WorkspaceMember`, and roles. Do not add them until collaboration is required.

## 8. Database migration strategy

1. Create local database: `createdb projectforge` or provision a Docker/Postgres instance.
2. Configure `.env.local` with `DATABASE_URL`.
3. Generate Prisma client: `npx prisma generate`.
4. For a fresh baseline, run `npx prisma migrate dev --name init`. Inspect generated SQL; it must create every table, enum, FK, index, and unique constraint.
5. If keeping the existing migration, verify it is preceded by a full table-creation migration. The current migration only adds indexes/constraints and is insufficient for an empty database.
6. Test migrations locally: reset a disposable DB with `npx prisma migrate reset`, then run app flows.
7. Staging: run `npx prisma migrate deploy` against staging and smoke-test all API endpoints.
8. Production: run `npx prisma migrate deploy` as a release step before promoting traffic, or during a maintenance-safe deployment window for breaking changes.
9. Future changes: use expand/migrate/contract. Add nullable columns first, backfill, switch code, then enforce non-null/remove old columns later.
10. Rollback: prefer code rollback. Database rollback should be a tested forward migration unless the change is reversible and no production data is lost.
11. Seed strategy: create `prisma/seed.ts` for local/test only. Seeds must be disabled in production and must not create demo projects for real users.
12. Production data protection: enable backups, restrict DB users, require SSL, never run `migrate reset` against staging/production.

## 9. API design

All production API responses should use this shape:

Success: `{ "data": ... }` for single resources or `{ "data": [...], "pagination": { ... } }` for lists.

Error: `{ "error": { "code": "VALIDATION_ERROR", "message": "User safe message", "details": [...] } }`.

### Auth/session

#### GET `/api/session`
- Auth: optional.
- Purpose: return current authenticated user profile.
- DB: upsert/select `User` when Supabase session is valid.
- Response: `{ data: { user: { id, email, name } } }` or `{ data: { user: null } }`.

### Dashboard

#### GET `/api/dashboard/summary`
- Auth: required.
- Authorization: own data only.
- Query params: optional date/window in future.
- DB: aggregate project count, average readiness, open tasks, unread notifications, recent activity.
- Response: summary object.
- Errors: 401 unauthenticated, 500 server error.

### Projects

#### GET `/api/projects`
- Auth: required.
- Query params: `search`, `status`, `priority`, `sort`, `page`, `pageSize`, `includeArchived=false`.
- Validation: page >= 1; pageSize 1-50; status/priority/sort allowed values.
- DB: `Project.findMany` with `ownerId`, filters, pagination, tags and count includes.
- Response: paginated list.
- Edge cases: empty list, invalid filters, expired session.

#### POST `/api/projects`
- Auth: required.
- Body: `name`, `description`, `platform`, `priority`, `deadline`, optional `tags`.
- Validation: reuse/extend `createProjectSchema`; deadline must be ISO date or null; tags trimmed/deduped.
- DB: transaction creates project, tags, initial optional discovery/document/task records if product requires them.
- Response: created project, 201.
- Errors: 400 validation, 409 duplicate `(ownerId,name)`, 401 auth.

#### GET `/api/projects/:projectId`
- Auth: required.
- Authorization: project `ownerId` must match session user.
- DB: select project with tags and artifact counts or detail includes.
- Response: full project overview.
- Errors: 404 for missing/not-owned to avoid leaking existence.

#### PATCH `/api/projects/:projectId`
- Auth: required.
- Body: partial fields: name, description, platform, status, priority, deadline, favorite, tags.
- Validation: same field constraints; archived projects should reject edits except restore.
- DB: transaction updates project and tag set.
- Response: updated project.

#### DELETE `/api/projects/:projectId`
- Auth: required.
- Behavior: soft archive by setting `archivedAt` and `status=ARCHIVED` initially. Hard delete can be separate admin-only endpoint later.
- Response: 204 or archived project.

### Discovery

#### GET/PUT `/api/projects/:projectId/discovery`
- Auth: required; own project only.
- Body fields: problem, targetUsers, painPoints, competitors, valueProposition, successMetrics, businessGoals.
- Validation: each nullable string with max length, e.g. 5000.
- DB: upsert `Discovery`.
- Response: discovery record.

### Requirements, stories, features, tasks, documents, notes

For each collection:

- `GET /api/projects/:projectId/<collection>`: list scoped records with pagination/order.
- `POST /api/projects/:projectId/<collection>`: create validated record.
- `PATCH /api/projects/:projectId/<collection>/:id`: update validated partial record.
- `DELETE /api/projects/:projectId/<collection>/:id`: delete or archive; child artifacts can hard delete unless audit requirements demand soft delete.

Validation should match schema columns: titles 1-160 chars, markdown/body max size based on server action/body limits, status/priority enums, positions integer >= 0.

### API endpoints and database tables

- `GET/POST/PATCH/DELETE /api/projects/:projectId/api-endpoints[/endpointId]`.
- `GET/POST/PATCH/DELETE /api/projects/:projectId/database-tables[/tableId]`.
- `POST/PATCH/DELETE /api/projects/:projectId/database-tables/:tableId/columns[/columnId]`.
- Validate HTTP methods, routes starting with `/`, JSON fields with size limits, unique table/column names.

### Notifications

- `GET /api/notifications?read=false`.
- `PATCH /api/notifications/:id` to mark read/unread.
- `POST` only from server services, not public clients.

## 10. Authentication and authorization

Recommended approach: Supabase Auth with Next.js route handler validation.

- Registration: client calls Supabase `signUp`; require email confirmation for production.
- Login: client calls Supabase `signInWithPassword`; store session using Supabase client defaults or SSR cookie helpers if server-rendered protected pages are added.
- Logout: client calls Supabase `signOut`, clears query cache, redirects to login.
- Password hashing: delegated to Supabase Auth.
- Password reset: client calls Supabase reset email; redirect URL must be configured in Supabase and deployment env.
- Sessions/tokens: API requests include current access token; server verifies token with Supabase.
- Refresh tokens: handled by Supabase client; test refresh behavior before production.
- Protected routes: use Next middleware or client guard. API routes must always enforce auth independently.
- Authorization: every project query includes `ownerId = currentUser.id`. Return 404 for not-owned resources.
- RBAC: not required until organizations/collaboration are implemented. Future roles: owner, admin, editor, viewer.
- Account security: enforce email verification, password policy, optional MFA when available, secure redirect allow-list.

## 11. Input validation

Validation must happen in three layers:

1. Frontend: React Hook Form + Zod for immediate feedback.
2. Backend: Zod at API boundary as source of truth.
3. Database: constraints, enums, unique indexes, FKs.

Important inputs:

| Input | Required validation |
| --- | --- |
| Email | trim, valid email, max 254. |
| Password | min 8 now; recommend 12+ in UI copy if Supabase policy allows. |
| Project name | trim, 2-80 chars, unique per owner. |
| Project description | trim, 10-500 chars for create; allow empty only if product wants drafts. |
| Platform | one of Web/Mobile/Desktop/API/SaaS or database enum. |
| Priority/status/work status | allowed enum values only. |
| Deadline | valid ISO date, nullable. |
| Tag names | trim, non-empty, max 40, dedupe case-insensitively. |
| Markdown/body fields | max size, no dangerous HTML rendering; render as escaped text or sanitized markdown. |
| API route contract | starts with `/`, max 200 chars, method enum, JSON size limit. |
| Positions | integer >= 0, scoped to project/collection. |

## 12. Error handling

Use stable error codes and user-safe messages.

| Case | HTTP | User message | Internal log |
| --- | --- | --- | --- |
| Validation failure | 400 | “Please check the highlighted fields.” | schema issue path, request id. |
| Unauthenticated | 401 | “Please sign in again.” | route, request id; no token. |
| Forbidden/not owner | 404 or 403 | Prefer 404 for project-owned resources. | user id, resource id hash/reference. |
| Duplicate project | 409 | “A project with this name already exists.” | Prisma code. |
| Rate limited | 429 | “Too many requests. Try again shortly.” | user/ip, route. |
| Database unavailable | 503 | “Service temporarily unavailable.” | DB error details. |
| Unexpected | 500 | “Something went wrong.” | stack trace in error tracker only. |

Never expose raw Prisma, Supabase, or stack trace errors to users.

## 13. Security checklist

- Secrets: put all secrets in environment variables; never commit `.env.local`.
- Frontend exposure: only `NEXT_PUBLIC_*` values can be exposed to browser.
- Auth: validate Supabase session server-side on every API route.
- Authorization: scope every project and child artifact by owner through project relation.
- SQL injection: use Prisma parameterized queries; avoid raw SQL except reviewed migrations.
- XSS: React escapes strings; sanitize markdown before rendering as HTML; avoid `dangerouslySetInnerHTML`.
- CSRF: bearer-token API calls are less exposed; if cookie auth is used, add SameSite cookies and CSRF tokens for mutations.
- CORS: same-origin by default; only add CORS allow-list if exposing API to external domains.
- Rate limiting: protect auth-adjacent endpoints and write-heavy endpoints by user/IP.
- File uploads: none currently; require private storage and validation when added.
- Passwords: delegated to Supabase; never handle/store password hashes in app DB.
- Logging: never log passwords, auth tokens, reset links, API keys, or full request bodies containing user data.
- DB permissions: app user should not own migration privileges in runtime; migration user separated if platform supports it.
- Dependency vulnerabilities: add `npm audit --omit=dev` or an equivalent scanner to CI.

## 14. Environment configuration

Create `.env.example` during implementation.

| Variable | Required | Example | Used by | Browser-safe |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Yes | `postgresql://USER:PASSWORD@HOST:5432/projectforge?schema=public` | Prisma CLI/runtime | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://project.supabase.co` | Browser/server Supabase | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `ey...` anon key placeholder | Browser/server Supabase | Yes, anon only |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional initially | placeholder | Server admin jobs only | No |
| `APP_URL` | Yes | `https://app.example.com` | auth redirects/email links | No/Yes depending usage |
| `SENTRY_DSN` | Optional | placeholder | error tracking | Usually yes if browser Sentry used |
| `RATE_LIMIT_REDIS_URL` | Optional later | `rediss://...` | rate limiting | No |
| `NODE_ENV` | provided | `production` | framework/runtime | No |

Separate local, staging, and production projects/databases. Never share staging/prod Supabase projects. Production must fail startup/API health if required server env vars are missing.

## 15. Replace frontend demo data flows

- Dashboard: `Dashboard -> projectQueries.list -> browser API client -> GET /api/projects -> auth -> project service -> Prisma -> response -> cards/chart/stats`.
- Create project: `Dashboard create form -> POST /api/projects -> Zod -> transaction -> return created id -> invalidate list -> navigate to detail`.
- Project detail: `Page params.id -> ProjectShell -> projectQueries.detail(id) -> GET /api/projects/:id -> owner check -> render real artifacts`.
- Auth: `AuthCard -> Supabase Auth -> session -> redirect -> protected dashboard`.
- Readiness: `Project detail/dashboard -> API includes readiness computed from persisted artifacts`.
- Activity: replace hardcoded copy with `Notification`/activity table or derive recent updated artifacts. Recommendation: add `ActivityEvent` only when activity feed becomes first-class; otherwise omit activity until real events exist.

## 16. Loading, empty, error, and failure states

| Feature | Loading | Empty | API/database failure | Unauthorized/session expired | Network failure | Partial data |
| --- | --- | --- | --- | --- | --- | --- |
| Landing | static | n/a | n/a | CTA to login/register | n/a | n/a |
| Auth | disabled submit + spinner | n/a | toast user-safe error | redirect/login prompt | retry message | n/a |
| Dashboard | skeleton cards/table | “No projects yet” + create CTA | error card + retry | redirect/login prompt | retry/offline message | show loaded cards and warning for missing summary |
| Project detail | page skeleton | 404/empty artifact sections | error boundary/retry | redirect/login prompt | retry/offline message | show available sections; mark failed sections |
| CRUD forms | disabled submit | n/a | inline/server error | redirect/login prompt | keep form values and retry | n/a |

## 17. External services

Current/required:

- Supabase Auth: registration, login, reset, verification. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; service role only for server admin flows. Failure handling: user-safe auth errors; retry only non-auth transient failures.
- Managed PostgreSQL: application persistence. Env: `DATABASE_URL`. Failure handling: 503 and health checks.
- Vercel or Next.js host: frontend/backend deployment. Env configured per environment.
- Error tracking, recommended: Sentry. Credentials: DSN. Do not log secrets.
- Uptime monitoring, recommended: health endpoint.

Not currently required: SMS, object storage, queues, AI APIs, webhooks.

## 18. File storage

The current app has no file uploads, avatars, images, or document attachments. Markdown documents are text records in the database. Do not add object storage yet. When uploads are introduced, use Supabase Storage or S3-compatible private buckets, max size limits, content type allow-list, malware scanning for untrusted files, signed URLs for private files, and delete-orphan cleanup.

## 19. Background jobs

No background infrastructure is required for current behavior. Future candidates:

- AI generation of PRDs/SRS/API docs: queue jobs with idempotency keys and status table.
- Email notifications beyond Supabase auth: transactional email provider or queue.
- Periodic cleanup: archived project retention or stale notification deletion.

Do not introduce a queue until one of these asynchronous features is actually implemented.

## 20. Testing strategy

Add test tooling because none exists now.

- Unit tests: `readinessScore`, schema validation, service rules, error mapping.
- Integration tests: Prisma repositories against disposable Postgres/Testcontainers or a dedicated test DB.
- API tests: route handlers for auth required, project list/create/detail/update/archive, child artifacts.
- Auth tests: unauthenticated rejected, invalid token rejected, valid Supabase user upserted, owner isolation prevents cross-user access.
- E2E tests: register/login, create project, view dashboard, open project, add requirement/task, archive project.
- Database tests: migrations from empty DB, unique constraints, cascades, archive behavior, indexes used for core list queries.

Recommended tooling: Vitest for unit/integration, Playwright for E2E, MSW for browser API mocks in component tests only.

## 21. Performance review

- Pagination: required for every list endpoint; page size max 50.
- Indexes: existing schema indexes are useful for owner/status/priority/read queries.
- N+1: use Prisma includes/counts carefully; avoid loading every child body in dashboard lists.
- Response size: dashboard should return summaries/counts, not full documents and notes.
- Caching: TanStack Query is enough initially. Add HTTP caching only for public marketing/static endpoints.
- Connection pooling: required on serverless deployments; use Prisma Accelerate or provider pooling if necessary.
- Bundle size: Recharts and Framer Motion are client-side; keep them only where used and consider dynamic imports if bundle grows.
- Rate limiting: write endpoints and auth-adjacent endpoints should be limited.

## 22. Logging and monitoring

- Application logs: structured JSON with request id, route, status, duration, authenticated user id when available.
- API logs: validation/auth/db failures at appropriate severity.
- DB errors: log sanitized Prisma error code and query context, not raw user content.
- Auth events: log login failures only through provider dashboards or sanitized app events.
- Critical business events: project created/archived, export generated, future AI job completed/failed.
- Error tracking: capture unexpected server/client exceptions with source maps.
- Uptime monitoring: check `/api/health` and a synthetic login/dashboard flow in staging/prod.
- Do not log passwords, tokens, API keys, reset URLs, or full markdown/document bodies by default.

## 23. CI/CD plan

Pipeline:

1. Checkout.
2. Install dependencies with `npm ci`.
3. Generate Prisma client: `npx prisma generate`.
4. Lint: `npm run lint`.
5. Type check: `npm run typecheck`.
6. Test: `npm test` after adding test script.
7. Build: `npm run build`.
8. Security scan: `npm audit --omit=dev` or configured scanner.
9. Migration check: validate migrations are present and run against disposable DB in CI.
10. Deploy preview/staging.
11. Run smoke tests/health check.
12. Production deploy with `npx prisma migrate deploy` before app promotion.
13. Rollback code if health checks fail; use forward DB fix if migration issue occurs.

## 24. Production deployment guide

1. Provision managed PostgreSQL with SSL, backups, PITR if available.
2. Provision Supabase project and configure allowed redirect URLs for local, staging, and production.
3. Create environment variables in Vercel/staging/prod.
4. Add `.env.example` with placeholders only.
5. Create full Prisma migration and run locally.
6. Run `npx prisma migrate deploy` in staging.
7. Deploy Next.js app to staging.
8. Smoke test auth and project CRUD.
9. Configure domain and HTTPS through hosting provider.
10. Configure production env vars.
11. Run production migrations.
12. Deploy production.
13. Verify health endpoint and critical user journey.
14. Enable monitoring/error tracking alerts.
15. Confirm backups and restore procedure.

## 25. Database backups and recovery

- Frequency: continuous/PITR if provider supports it; otherwise daily automated snapshots minimum.
- Retention: 7 days minimum for early production, 30 days recommended.
- Restore procedure: restore backup to a new database, run app smoke tests against restored DB, then repoint app only after validation.
- Disaster recovery: document RTO/RPO. For early app, target RPO <= 24h if daily backups, lower with PITR.
- Corruption/unavailability: put app in maintenance mode or display service unavailable; never run destructive reset commands.

## 26. Production checklist

### Code
- [ ] Remove or relabel demo data.
- [ ] Replace localStorage repository.
- [ ] Remove fake auth redirects.
- [ ] Remove hardcoded `/projects/atlas` dependency.
- [ ] Complete dynamic project detail route.

### Backend
- [ ] API routes implemented.
- [ ] Services/repositories separated.
- [ ] Validation on every mutation.
- [ ] Authentication on every protected endpoint.
- [ ] Owner authorization on every project resource.
- [ ] Consistent error format.
- [ ] Rate limiting added.

### Database
- [ ] Full initial migration.
- [ ] Indexes and unique constraints verified.
- [ ] Timestamps on editable entities.
- [ ] Migration deploy tested.
- [ ] Backups enabled.

### Security
- [ ] Secrets protected.
- [ ] CORS policy reviewed.
- [ ] Security headers configured.
- [ ] Dependency audit in CI.
- [ ] Sensitive logs prevented.

### Testing
- [ ] Unit tests.
- [ ] Integration tests.
- [ ] API tests.
- [ ] Auth/authorization tests.
- [ ] E2E critical journey tests.

### Deployment
- [ ] Staging environment.
- [ ] Production environment.
- [ ] Domain and HTTPS.
- [ ] CI/CD pipeline.
- [ ] Health checks.
- [ ] Monitoring and alerts.

## 27. Implementation order

### Phase 1 — Stabilize baseline

Goal: keep current UI working while preparing seams.
Files/modules affected: docs, `src/features/projects`, `src/lib/schemas.ts`.
Implement: no runtime change yet; add docs/tests config in later step.
Dependencies: none.
Commands: `npm run lint`, `npm run typecheck`, `npm run build`.
Expected result: current app still builds.
Verify: no behavior regression.
Potential problems: accidental removal of demo data before backend exists.

### Phase 2 — Finalize database schema

Goal: make Prisma schema production-complete.
Files/modules affected: `prisma/schema.prisma`, migrations.
Implement: timestamps on children, enum alignment, complete initial migration.
Dependencies: database decision.
Commands: `npx prisma format`, `npx prisma migrate dev --name init`, `npx prisma generate`.
Expected result: fresh DB can be created.
Verify: `npx prisma migrate reset` against disposable DB.
Potential problems: existing migration is not a full baseline.

### Phase 3 — Backend foundation

Goal: create safe API foundation.
Files/modules affected: `src/server/**`, `src/app/api/health/route.ts`.
Implement: env validation, Prisma client, error helpers, auth helper skeleton, health route.
Dependencies: schema.
Commands: `npm run typecheck`, `npm run lint`.
Expected result: health endpoint can check DB.
Verify: local request to `/api/health`.
Potential problems: Prisma/serverless connection setup.

### Phase 4 — Authentication

Goal: replace fake auth.
Files/modules affected: `AuthCard`, auth utilities, middleware/protected routes.
Implement: Supabase login/register/reset/logout, server token validation, user upsert.
Dependencies: Supabase project/env vars.
Commands: `npm run typecheck`, auth E2E tests.
Expected result: unauthenticated users cannot use workspace.
Verify: invalid session is rejected; valid session loads dashboard.
Potential problems: redirect URL misconfiguration.

### Phase 5 — Core project APIs

Goal: database-backed project CRUD.
Files/modules affected: `src/app/api/projects/**`, services/repositories.
Implement: list/create/detail/update/archive with validation and owner checks.
Dependencies: auth.
Commands: API tests, integration tests.
Expected result: projects persist in PostgreSQL.
Verify: create in browser, see in DB, reload from another browser session.
Potential problems: enum mismatch with UI.

### Phase 6 — Connect frontend to APIs

Goal: remove localStorage dependency.
Files/modules affected: `project-repository.ts`, dashboard, project shell.
Implement: fetch-based API client, loading/error/empty states, mutation invalidation.
Dependencies: core APIs.
Commands: `npm run build`, E2E tests.
Expected result: dashboard/detail use real data.
Verify: localStorage clear does not remove data.
Potential problems: session token refresh.

### Phase 7 — Artifact modules

Goal: make workspace sections real.
Files/modules affected: project shell child components, artifact APIs.
Implement: discovery, requirements, stories, features, API endpoints, DB tables/columns, tasks, docs, notes.
Dependencies: project detail API.
Commands: API/E2E tests.
Expected result: all displayed artifacts are persisted.
Verify: CRUD each section.
Potential problems: scope creep; implement incrementally.

### Phase 8 — Remove demo functionality

Goal: ensure no fake user data remains.
Files/modules affected: `src/data/mock.ts`, `src/data/content.ts`, dashboard/project shell.
Implement: keep marketing constants only; remove sample projects and hardcoded Atlas workspace.
Dependencies: frontend connected to APIs.
Commands: `rg "localStorage|sampleProjects|Atlas CRM|demoProject" src`.
Expected result: no demo data in protected app.
Verify: new user sees empty dashboard.
Potential problems: marketing example text can be mistaken for data; label clearly.

### Phase 9 — Testing and security hardening

Goal: production quality gates.
Files/modules affected: test config, API tests, CI.
Implement: Vitest/Playwright, rate limit, headers, audit, error tracking.
Dependencies: core functionality complete.
Commands: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit --omit=dev`.
Expected result: CI blocks unsafe changes.
Verify: failing auth/owner tests catch regressions.
Potential problems: test DB flakiness.

### Phase 10 — Deployment and monitoring

Goal: live-ready release.
Files/modules affected: Vercel/env/CI docs.
Implement: staging/prod env, migrations, health checks, monitoring, backups.
Dependencies: tests pass.
Commands: `npx prisma migrate deploy`, smoke tests.
Expected result: production app is available and monitored.
Verify: health check, login, create project, backup confirmation.
Potential problems: migration ordering and connection pooling.

## 28. Developer execution guide

### Step 1 — Create documentation and baseline checks

Objective: document current state and verify app builds before changing runtime.
Files to modify: `PRODUCTION_IMPLEMENTATION_GUIDE.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`.
Implementation: add docs only.
Commands: `npm run lint`, `npm run typecheck`, `npm run build`.
Expected result: baseline remains green.
Verification: no runtime files changed.
Common problems: documenting desired architecture as if already implemented.

### Step 2 — Add environment template

Objective: make required config explicit.
Files to modify: `.env.example`, README.
Implementation: list placeholders for DB, Supabase, app URL, optional monitoring.
Commands: `cp .env.example .env.local`.
Expected result: developer knows required variables.
Verification: no real secrets committed.
Common problems: exposing service role keys to browser.

### Step 3 — Fix Prisma baseline

Objective: ensure database can be created from scratch.
Files to modify: `prisma/schema.prisma`, `prisma/migrations/**`.
Implementation: add missing timestamps/enum decisions; generate full migration.
Commands: `npx prisma format`, `npx prisma migrate dev --name init`, `npx prisma generate`.
Expected result: local database contains all tables.
Verification: inspect DB and run migration reset on disposable DB.
Common problems: current migration only adds indexes; do not rely on it as initial migration.

### Step 4 — Add backend foundation

Objective: create reusable server utilities.
Files to modify: `src/server/db/prisma.ts`, `src/server/config/env.ts`, `src/server/http/errors.ts`, `src/app/api/health/route.ts`.
Implementation: lazy Prisma client, env validation, standard JSON errors, DB health check.
Commands: `npm run typecheck`.
Expected result: API routes can safely access DB.
Verification: `/api/health` returns ok locally.
Common problems: Prisma connection pooling on serverless.

### Step 5 — Implement Supabase auth integration

Objective: replace fake auth redirects.
Files to modify: `src/components/workspace/auth-card.tsx`, `src/server/auth/session.ts`, optional middleware.
Implementation: signUp/signIn/reset/signOut, token validation, app user upsert.
Commands: `npm run typecheck`, E2E auth tests.
Expected result: protected app requires real session.
Verification: direct `/dashboard` access redirects/blocks unauthenticated user.
Common problems: Supabase redirect URL not configured.

### Step 6 — Implement project APIs

Objective: persist core projects.
Files to modify: `src/app/api/projects/**`, `src/server/services/project-service.ts`, `src/server/repositories/project-repository.ts`.
Implementation: list/create/detail/update/archive with owner checks and Zod validation.
Commands: API/integration tests.
Expected result: database-backed project CRUD.
Verification: create project and reload from DB.
Common problems: duplicate names and status enum mismatch.

### Step 7 — Replace browser repository internals

Objective: keep UI API stable while changing data source.
Files to modify: `src/features/projects/project-repository.ts` or rename to `api-client.ts`.
Implementation: replace localStorage with authenticated fetch calls.
Commands: `rg "localStorage|seedProjects" src/features src/components`.
Expected result: no localStorage persistence remains for projects.
Verification: data survives browser storage clear.
Common problems: missing auth header or token refresh.

### Step 8 — Connect dashboard

Objective: replace static dashboard numbers/cards.
Files to modify: `src/components/workspace/dashboard.tsx`, child components if extracted.
Implementation: use project list query, computed/summary stats, create form, archive/favorite actions, loading/empty/error states.
Commands: E2E dashboard tests.
Expected result: dashboard reflects current user DB data.
Verification: new account shows empty state, project creation updates list.
Common problems: over-fetching full artifact bodies for dashboard.

### Step 9 — Connect project detail and artifact CRUD

Objective: make `/projects/[id]` real.
Files to modify: `src/app/projects/[id]/page.tsx`, `ProjectShell`, artifact components/API routes.
Implementation: pass route id, fetch project, implement CRUD per section.
Commands: E2E project tests.
Expected result: each section displays persisted project-owned artifacts.
Verification: unrelated user cannot access project id.
Common problems: building every module at once; ship section by section.

### Step 10 — Remove or isolate demo data

Objective: prevent demo data from appearing as production data.
Files to modify: `src/data/mock.ts`, `src/data/content.ts`, README, seeds.
Implementation: remove sample projects from app paths; keep only marketing taxonomy or dev/test seed fixtures.
Commands: `rg "Atlas CRM|Pulse Mobile|Forge API|demoProject|sampleProjects|localStorage" src`.
Expected result: no fake projects in authenticated workspace.
Verification: production DB starts empty.
Common problems: marketing examples confused with user data.

### Step 11 — Add tests and CI

Objective: enforce production behavior.
Files to modify: package scripts, test files, CI workflow.
Implementation: add Vitest/Playwright, test DB setup, CI pipeline.
Commands: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.
Expected result: CI catches regressions.
Verification: intentionally failing auth owner test fails CI.
Common problems: no isolated test DB.

### Step 12 — Deploy staging then production

Objective: launch safely.
Files to modify: deployment/env settings, README runbook.
Implementation: provision DB/Supabase, run migrations, deploy, smoke test, monitor.
Commands: `npx prisma migrate deploy`, smoke test script, health check.
Expected result: production app works with real auth/data.
Verification: login/create/open/archive project in production.
Common problems: missing env vars, failed migrations, no rollback plan.

## Open Questions / Decisions Required

1. Should ProjectForge remain single-user project ownership for launch, or is team/workspace collaboration required for the first production release?
2. Should project status labels follow the current UI (`Discovery`, `Planning`, `Architecture`, `Ready`, `Archived`) or the current Prisma enum (`DISCOVERY`, `PLANNING`, `ACTIVE`, `COMPLETED`, `ARCHIVED`)?
3. Should AI-assisted actions be included in the first production launch, or should they remain disabled until a separate AI provider, cost controls, and job queue are specified?
4. Is soft archive sufficient for projects at launch, or is user-visible hard delete/export compliance required?
