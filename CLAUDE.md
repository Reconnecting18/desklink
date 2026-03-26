# DeskLink - Claude Code Guide

## Project Overview

DeskLink is a unified productivity manager API combining features of Notion, OneDrive, Microsoft 365, and Google Workspace. Built with Express + TypeScript + Prisma (PostgreSQL).

## Quick Commands

```bash
npm run dev          # Start dev server (tsx watch)
npm run build        # Compile TypeScript
npm run test         # Run tests (vitest)
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Regenerate Prisma client
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
```

## Architecture

### Module Pattern
Every feature module lives in `src/modules/<name>/` and follows this structure:
- `<name>.schema.ts` — Zod validation schemas + inferred TypeScript types
- `<name>.service.ts` — Business logic + Prisma queries (never import Request/Response)
- `<name>.controller.ts` — Thin HTTP handlers: extract params, call service, return JSON
- `<name>.routes.ts` — Express Router with middleware (auth, validate, etc.)
- `<name>.ws.ts` — WebSocket message handlers (whiteboard, documents only)
- `index.ts` — Barrel export of routes

### Key Conventions
- All API responses use `{ success: true, data: ... }` or `{ success: false, error: { message, statusCode } }`
- Controllers never import Prisma directly — always go through the service layer
- Zod schemas are the source of truth for request validation types (use `z.infer<typeof schema>`)
- Custom errors in `src/shared/errors.ts` map to HTTP status codes via `src/middleware/errorHandler.ts`
- File operations go through `src/storage/storage.interface.ts` abstraction — never use `fs` directly in modules
- WebSocket messages are JSON with `{ type, room, payload }` structure

### Route Mounting
- Auth routes: `/api/auth/*` (mounted directly)
- Workspace routes: `/api/workspaces/*` (mounted at `/api/workspaces`)
- All other modules: mounted at `/api` (routes include full paths like `/workspaces/:workspaceId/projects`)
- AI routes: `/api/ai/*` (mounted at `/api/ai`)

### Database
- Prisma 7 — schema at `prisma/schema.prisma`, config at `prisma/prisma.config.ts`
- The `url` is NOT in schema.prisma (Prisma 7 moved it to config/constructor)
- Client singleton at `src/config/database.ts`
- Run `npx prisma generate` after schema changes, `npm run db:migrate` for migrations

### AI Module
- Dual adapter pattern: `AIProvider` interface in `ai.provider.ts`
- `claude.adapter.ts` — uses `@anthropic-ai/sdk`
- `mock.adapter.ts` — returns canned responses (default)
- Switched via `AI_PROVIDER` env var (`mock` | `claude`)

### Environment
- Config validated with Zod at startup (`src/config/index.ts`)
- Copy `.env.example` to `.env` for local development
- Docker Compose provides PostgreSQL + Redis

## Testing

Tests use vitest + supertest. Test files go in `tests/modules/`.

## Common Tasks

### Adding a new module
1. Create `src/modules/<name>/` with schema, service, controller, routes, index files
2. Add Prisma models to `prisma/schema.prisma` and run `npm run db:migrate`
3. Import and mount routes in `src/app.ts`

### Adding a new AI provider
1. Implement `AIProvider` interface from `src/modules/ai/ai.provider.ts`
2. Add the adapter to `src/modules/ai/ai.service.ts` `getProvider()` function
3. Add the new provider option to `AI_PROVIDER` enum in `src/config/index.ts`
