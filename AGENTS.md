# DeskLink — agent & contributor guide

Canonical project instructions for Cursor and developers. User-facing API catalog and setup: [README.md](README.md).

## Contents

1. [Project overview](#project-overview)
2. [Quick commands](#quick-commands)
3. [Backend architecture](#backend-architecture)
4. [API contracts](#api-contracts)
5. [Electron client](#electron-client)
6. [AI module](#ai-module)
7. [Environment](#environment)
8. [Testing](#testing)
9. [Common tasks](#common-tasks)
10. [Conventional commits](#conventional-commits)
11. [GitHub workflow](#github-workflow)
12. [Code review checklist](#code-review-checklist)
13. [Documentation](#documentation)
14. [Debugging & performance](#debugging--performance)
15. [Out-of-repo patterns](#out-of-repo-patterns)

---

## Project overview

DeskLink is a unified productivity manager API (workspaces, planner, whiteboard, mockups, documents, files, AI). **Backend:** Express + TypeScript + Prisma (SQLite). **Desktop:** Electron app under `client/` (React renderer, secure preload). There is **no** Python or SQLAlchemy service in this repository. The app has zero infrastructure dependencies — no Docker or external database required to run.

---

## Quick commands

```bash
npm run dev          # API dev server (tsx watch)
npm run build        # Compile API TypeScript
npm run test         # Tests (vitest)
npm run db:migrate   # Prisma migrations
npm run db:generate  # Regenerate Prisma client
npm run db:seed      # Seed demo data
npm run db:studio    # Prisma Studio
```

Client app commands live in `client/package.json` if present. Full script tables: [README.md](README.md).

---

## Backend architecture

### Module pattern

Each feature module lives in `src/modules/<name>/`:

| File | Role |
|------|------|
| `<name>.schema.ts` | Zod schemas + inferred types |
| `<name>.service.ts` | Business logic + Prisma (no `Request`/`Response`) |
| `<name>.controller.ts` | Thin handlers: params → service → JSON |
| `<name>.routes.ts` | Express `Router`, middleware, validation |
| `<name>.ws.ts` | WebSocket handlers (whiteboard, documents) |
| `index.ts` | Barrel exports |

### Conventions

- Zod schemas are the source of truth for request types (`z.infer<typeof schema>`).
- Controllers do not import Prisma; use services only.
- Custom errors: `src/shared/errors.ts` → HTTP via `src/middleware/errorHandler.ts`.
- Files: use `src/storage/storage.interface.ts` — not raw `fs` in feature modules.
- WebSocket messages: JSON `{ type, room, payload }`.

### Route mounting

- Auth: `/api/auth/*`
- Workspaces: `/api/workspaces/*`
- Other modules: mounted under `/api` with full paths (e.g. `/workspaces/:workspaceId/projects`).
- AI: `/api/ai/*`

### Database

- **SQLite** via Prisma 7 + `@prisma/adapter-better-sqlite3`. No external database server needed.
- Schema: `prisma/schema.prisma`; connection config in `prisma/prisma.config.ts`.
- DB file: `prisma/dev.db` (gitignored). `DATABASE_URL=file:./dev.db` in `.env`.
- Client singleton: `src/config/database.ts` (resolves the DB path relative to `prisma/`).
- After schema changes: `npx prisma generate` and `npm run db:migrate`.
- SQLite has no native enums or JSON columns. Enums are stored as `String` with valid-value comments in the schema. JSON data is stored as `String`; services handle `JSON.stringify`/`JSON.parse` at the Prisma boundary.

---

## API contracts

### Success and error envelope

Match the live handlers and `errorHandler`:

- **Success:** `{ success: true, data: T }` (and optional `message` where already used).
- **Error:** `{ success: false, error: { message: string, statusCode: number } }`

Do not expose stack traces, internal paths, or raw DB errors to clients in production.

### Implementation rules

- RESTful, resource-style paths.
- Validate at the route boundary (Zod).
- Business logic stays in services.
- Log and sanitize failures; use `AppError` for expected failures.

---

## Electron client

### Security baseline

- `contextIsolation: true`, `nodeIntegration: false`.
- No raw `ipcRenderer` in the renderer; expose only typed APIs via `contextBridge` in `client/src/preload/index.ts`.

### IPC surface (current)

Document channels here when adding or changing them.

| Area | Mechanism | Channels / API |
|------|-----------|----------------|
| Window | `send` / `invoke` / `on` | `window:minimize`, `window:maximize`, `window:close`, `window:isMaximized`, `window:maximizeChanged` |
| Tokens | `invoke` | `token:store`, `token:get`, `token:delete`, `token:clear` |

Preload exposes `window.api.*` (minimize, maximize, close, isMaximized, onMaximizeChange, storeToken, getToken, deleteToken, clearTokens).

---

## AI module

- Interface: `AIProvider` in `src/modules/ai/ai.provider.ts`.
- Adapters: `claude.adapter.ts` (`@anthropic-ai/sdk`), `mock.adapter.ts` (default).
- Switch with `AI_PROVIDER` (`mock` | `claude`) in `src/config/index.ts`.

---

## Environment

- Validated at startup: `src/config/index.ts`.
- Copy `.env.example` → `.env`.
- Docker Compose: Redis only (PostgreSQL service commented out). Docker is optional — only needed if you use Redis features.

---

## Testing

- Vitest + Supertest; tests under `tests/modules/`.

---

## Common tasks

### New module

1. Add `src/modules/<name>/` (schema, service, controller, routes, index).
2. Extend `prisma/schema.prisma` if needed; migrate.
3. Register routes in `src/app.ts`.

### New AI provider

1. Implement `AIProvider` (`src/modules/ai/ai.provider.ts`).
2. Register in `src/modules/ai/ai.service.ts` `getProvider()`.
3. Extend `AI_PROVIDER` in `src/config/index.ts`.

---

## Conventional commits

Format:

```text
type(scope): short description
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`

**Scopes (required):** pick the area touched:

| Scope | Use for |
|-------|---------|
| `api` | `src/` API, modules, middleware (excluding AI-only) |
| `client` | `client/` Electron app (renderer, main, preload, build) |
| `ai` | `src/modules/ai/` and AI config |
| `db` | Prisma schema, migrations, seeds |
| `ci` | CI/CD workflows |
| `shared` | Cross-cutting `src/shared` or shared types/utilities |
| `ipc` | Electron IPC contracts only (when scope is not just general `client`) |

**Rules:** imperative mood; lowercase type, scope, description; no trailing period on subject; subject ≤ 72 characters.

**Examples:** `feat(api): add workspace filter to list endpoint`, `fix(client): await token get before refresh`, `chore(db): add index on tasks column`

---

## GitHub workflow

- Prefer branches: `feature/short-description`, `fix/short-description`; avoid force-push to `main`.
- Use `gh` for GitHub operations when automating.
- PRs: what changed, why, how to test, risks; include explicit testing steps.
- Link issues in commit body: `Closes #123` when applicable.
- After CI: summarize pass/fail and smallest next fix if failing.

---

## Code review checklist

Before finishing a change:

- Scope matches the request; no unrelated refactors.
- Errors handled; no empty `catch` / swallowed failures without justification.
- Async usage correct (`await` everywhere needed).
- API routes validated with Zod; logic in services.
- No Node APIs in Electron renderer (use preload IPC).
- **AI:** provider/model from config; mock path works without API keys.
- Commits: conventional with required scope.
- **Docs:** update this file (`AGENTS.md`) if architecture, IPC channels, or API contracts change.

If something cannot be fixed in the same change, add a short `TODO` with scope, e.g. `// TODO(code-review): ...`.

---

## Documentation

- **Canonical:** this file (`AGENTS.md`) for agent and internal technical rules.
- **User-facing:** [README.md](README.md).
- When behavior or contracts change, update **this file** in the same PR when possible.
- If a fact cannot be verified, mark it in the relevant doc with a short “needs verification” note rather than guessing.

---

## Debugging & performance

- **Errors:** Read full stack trace; identify layer (API, Prisma, Electron main/preload/renderer); fix root cause; consider a regression test.
- **Performance:** Measure before/after on hot paths; prefer small, safe changes; preserve API contracts unless asked otherwise.

---

## Out-of-repo patterns

The following are **not** part of this repository’s stack. Do not implement or assume them unless a new service is added:

- Python / FastAPI / async SQLAlchemy APIs
- E3N / Ollama as the primary AI path (DeskLink uses the `ai` module with mock/Claude)

If you add a new stack later, extend this section and the scopes table instead of reviving deleted skill files.
