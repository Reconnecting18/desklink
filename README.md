# DeskLink

**Unified Productivity Manager API** — Notion + OneDrive + Microsoft 365 + Google Workspace, rolled into one.

DeskLink provides a comprehensive REST + WebSocket API for managing workspaces, whiteboards, mockups, project planning, documents, file storage, and AI-powered productivity features.

Contributor and AI agent conventions (architecture, API contracts, IPC, commits): see [AGENTS.md](AGENTS.md).

## Features

| Module | Description |
|--------|-------------|
| **Auth** | JWT-based authentication with register, login, token refresh, and profile management |
| **Workspaces** | Multi-tenant workspaces with role-based access control (Admin/Member/Viewer) |
| **Whiteboard** | Collaborative whiteboard with shapes, text, drawings — real-time sync via WebSocket |
| **Mockups** | UI wireframe/mockup builder with screens, component trees, and review annotations |
| **Planner** | Projects, kanban boards, tasks with filtering, comments, labels, and calendar events |
| **Documents** | Word, Excel, and PowerPoint analogs with version history, restore, and export |
| **Files** | File upload/download with folder hierarchy, versioning, and storage abstraction |
| **AI** | Summarize, generate, and suggest endpoints — dual adapter (Claude API + mock fallback) |

## Tech Stack

- **Runtime:** Node.js 22 + TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL with Prisma 7 ORM
- **WebSocket:** `ws` with custom room/auth layer
- **Validation:** Zod v4
- **Auth:** JWT + bcrypt
- **Logging:** Pino
- **AI:** Anthropic Claude SDK (switchable to mock)
- **Infrastructure:** Docker Compose (PostgreSQL + Redis)

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose (for database)
- npm

### Setup

```bash
# Clone the repo
git clone https://github.com/reconnecting18/desklink.git
cd desklink

# Install dependencies
npm install

# Start PostgreSQL + Redis
docker compose up -d

# Configure environment
cp .env.example .env
# Edit .env with your settings (defaults work for local dev)

# Run database migrations
npm run db:migrate

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

The API will be running at `http://localhost:3000`.

### Desktop client (Electron)

The app in `client/` calls the REST API over HTTP. For local development you need **two processes**:

1. Start the API from the **repository root** (`npm run dev`). Ensure PostgreSQL (and Redis, if required) are running as above.
2. In another terminal, run the desktop client: `cd client && npm install && npm run dev`.

If the API listens on a non-default port, set `VITE_API_BASE_URL` in `client/.env` (see [`client/.env.example`](client/.env.example)), for example `VITE_API_BASE_URL=http://127.0.0.1:4000/api`.

### Demo Credentials

After seeding:
- **Demo user:** `demo@desklink.io` / `password123`
- **Second user:** `alice@desklink.io` / `password123`

## API Overview

### Health Check

```
GET /api/health
```

### Authentication

```
POST /api/auth/register     — Register new user
POST /api/auth/login        — Login (returns JWT tokens)
POST /api/auth/refresh      — Refresh access token
GET  /api/auth/me           — Get current user profile
PATCH /api/auth/me          — Update profile
```

### Workspaces

```
POST   /api/workspaces                          — Create workspace
GET    /api/workspaces                          — List user's workspaces
GET    /api/workspaces/:id                      — Get workspace
PATCH  /api/workspaces/:id                      — Update workspace
DELETE /api/workspaces/:id                      — Delete workspace
POST   /api/workspaces/:id/members              — Add member
GET    /api/workspaces/:id/members              — List members
DELETE /api/workspaces/:id/members/:userId       — Remove member
```

### Planner

```
POST   /api/workspaces/:wsId/projects           — Create project
GET    /api/workspaces/:wsId/projects           — List projects
GET    /api/projects/:id                        — Get project
PATCH  /api/projects/:id                        — Update project
DELETE /api/projects/:id                        — Delete project

POST   /api/projects/:id/boards                 — Create board
GET    /api/projects/:id/boards                 — List boards
GET    /api/boards/:id                          — Get board (with columns + tasks)

POST   /api/projects/:id/tasks                  — Create task
GET    /api/projects/:id/tasks                  — List tasks (filterable)
PATCH  /api/tasks/:id                           — Update task
PATCH  /api/tasks/:id/move                      — Move task between columns

POST   /api/tasks/:id/comments                  — Add comment
POST   /api/tasks/:id/labels                    — Add label
POST   /api/projects/:id/events                 — Create calendar event
GET    /api/projects/:id/events                 — List events (date range filter)
```

### Whiteboard

```
POST   /api/workspaces/:wsId/whiteboards        — Create whiteboard
GET    /api/workspaces/:wsId/whiteboards        — List whiteboards
GET    /api/workspaces/:wsId/whiteboards/:id    — Get whiteboard + elements

POST   /api/whiteboards/:id/elements            — Add element
PATCH  /api/whiteboards/:id/elements/:elemId    — Update element
DELETE /api/whiteboards/:id/elements/:elemId    — Delete element

WebSocket: ws://localhost:3000/ws?token=<JWT>
  → Join:    { type: "join", room: "whiteboard:<id>" }
  → Events:  element:create, element:update, element:delete, cursor:move
```

### Mockups

```
POST   /api/workspaces/:wsId/mockups            — Create mockup
GET    /api/workspaces/:wsId/mockups            — List mockups
POST   /api/mockups/:id/screens                 — Add screen
PATCH  /api/mockups/:id/screens/:screenId       — Update screen
POST   /api/mockups/:id/screens/:screenId/annotations — Add annotation
```

### Documents

```
POST   /api/workspaces/:wsId/documents          — Create document (DOCUMENT|SPREADSHEET|PRESENTATION)
GET    /api/workspaces/:wsId/documents          — List documents (filter by type)
PATCH  /api/workspaces/:wsId/documents/:id      — Update content

GET    /api/documents/:id/versions              — Version history
POST   /api/documents/:id/versions              — Save version snapshot
POST   /api/documents/:id/restore/:version      — Restore to version
GET    /api/documents/:id/export?format=json|html — Export document

WebSocket: ws://localhost:3000/ws?token=<JWT>
  → Join:    { type: "join", room: "document:<id>" }
  → Events:  content:update, cursor:move
```

### Files

```
POST   /api/workspaces/:wsId/files/upload       — Upload file (multipart)
POST   /api/workspaces/:wsId/files/folder       — Create folder
GET    /api/workspaces/:wsId/files              — List files (?parentId= for navigation)
GET    /api/workspaces/:wsId/files/:id/download — Download file

GET    /api/files/:id/versions                  — List file versions
POST   /api/files/:id/upload                    — Upload new version
```

### AI

```
POST   /api/ai/summarize    — Summarize content (text, documents, task lists)
POST   /api/ai/generate     — Generate content (documents, tasks, presentations, emails)
POST   /api/ai/suggest      — Smart suggestions (priorities, next steps, improvements)
GET    /api/ai/history       — AI request history
```

Set `AI_PROVIDER=claude` and `ANTHROPIC_API_KEY=sk-...` in `.env` for live AI. Default is `mock` (works without API key).

## Project Structure

```
src/
├── config/          # Environment validation, Prisma client
├── middleware/      # Auth, error handler, validation, rate limiting, upload, RBAC
├── modules/
│   ├── auth/        # Authentication & user profiles
│   ├── workspace/   # Multi-tenant workspaces
│   ├── planner/     # Projects, boards, tasks, calendar
│   ├── whiteboard/  # Collaborative whiteboard + WebSocket
│   ├── mockups/     # UI mockup screens + annotations
│   ├── documents/   # Document management + versioning
│   ├── files/       # File storage + versioning
│   └── ai/          # AI integration (dual adapter)
├── storage/         # Storage abstraction (local filesystem, extensible to S3)
├── websocket/       # WebSocket server with rooms + auth
└── shared/          # Errors, logger, pagination utilities
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production server |
| `npm test` | Run test suite |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio GUI |

## Environment Variables

See [`.env.example`](.env.example) for all available configuration options.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | — | Secret for JWT signing (min 16 chars) |
| `AI_PROVIDER` | `mock` | AI provider (`mock` or `claude`) |
| `ANTHROPIC_API_KEY` | — | Anthropic API key (required if `AI_PROVIDER=claude`) |
| `MAX_FILE_SIZE` | `52428800` | Max upload size in bytes (50MB) |

## License

ISC
