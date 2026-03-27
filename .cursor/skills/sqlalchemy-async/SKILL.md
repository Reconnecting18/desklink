---
name: sqlalchemy-async
description: >-
  Enforces async SQLAlchemy 2.x patterns for FastAPI and async Python services:
  AsyncSession-only, dependency-injected sessions, explicit loader options
  (selectinload/joinedload), explicit transactions, select()+execute(), bulk
  insert patterns, session lifecycle, and Pydantic response models. Use when
  writing or reviewing Python database code, AsyncSession, SQLAlchemy models,
  repositories, or services that touch the DB; flag sync Session/query patterns
  in async code as bugs (event-loop blocking).
---

# SQLAlchemy Async

## When To Apply

Use this skill whenever Python code uses SQLAlchemy with async I/O: FastAPI routes, services, repositories, background tasks, or tests that share the same async stack.

## Core Rules

### 1. AsyncSession only

- Import and use `AsyncSession` from `sqlalchemy.ext.asyncio`.
- Do not mix synchronous `Session` (or sync engine) with async route handlers or `async def` services; that blocks the event loop.
- **Review:** Any `Session()`, sync `create_engine`, or `sessionmaker` bound to a sync engine inside async app code is a **bug**.

### 2. Dependency-injected sessions

- Obtain the session via FastAPI `Depends(get_async_session)` (or the project’s equivalent factory).
- Do **not** construct `AsyncSession` inside a route or service function body for ad hoc use.

### 3. No lazy loads outside session scope

- Do not rely on implicit lazy loading after the session is closed or after `await session.commit()`.
- Declare loaders on the query that needs related data:
  - **`selectinload()`** — one-to-many / collections (separate `IN` query; avoids huge joins).
  - **`joinedload()`** — many-to-one / single related object when a join is appropriate.
- If related data is missing from the query, treat it as a bug, not an N+1 “optimization later.”

### 4. Explicit commit and rollback

- Do not assume auto-commit.
- In service-layer functions that mutate data, use `try` / `except` with `await session.rollback()` on failure and `await session.commit()` on success where the unit of work should commit.

### 5. `execute()` + `select()` (2.0 style)

- Use `await session.execute(select(Model).where(...))` and read `.scalars()` / `.scalar_one()` / `.unique()` as needed.
- Avoid legacy `Session.query()` on async sessions.

### 6. Bulk inserts

- Prefer a single statement such as `await session.execute(insert(Table).values([{...}, {...}]))` (or ORM bulk APIs where appropriate).
- Avoid loops of per-row `session.add()` / individual inserts when a bulk construct is suitable.

### 7. Connection pooling

- Default `AsyncEngine` pool settings are acceptable for local development.
- Any production tuning (pool size, `pool_recycle`, timeouts) must be documented in `CLAUDE.md` (or the project’s ops doc), not only in code comments.

### 8. Session lifecycle

- Prefer **`async with session_factory()`** or dependency scopes that guarantee close.
- Ensure the session is closed after use; do not leak sessions across requests.

### 9. API responses: Pydantic only

- Do not return ORM model instances directly from API handlers.
- Map to Pydantic (or equivalent) schemas so fields, relations, and serialization are explicit and stable.

## Review Checklist

```text
SQLAlchemy Async Checklist
- [ ] AsyncSession from sqlalchemy.ext.asyncio; no sync Session in async paths
- [ ] Session from Depends / factory; not constructed in route body
- [ ] Related data loaded via selectinload/joinedload on the same query
- [ ] try/except with rollback; explicit commit where needed
- [ ] select() + execute(); no Session.query()
- [ ] Bulk inserts use insert().values([...]) or appropriate bulk API
- [ ] Production pool settings documented in CLAUDE.md if non-default
- [ ] Session closed (async with / dependency teardown)
- [ ] Responses use Pydantic (or typed DTOs), not raw ORM objects
```

## Anti-Patterns (Treat as Bugs in Async Code)

| Pattern | Why |
|--------|-----|
| Sync `Session` / sync engine in `async def` | Blocks event loop |
| `Session.query()` | Legacy; wrong style for 2.0 async |
| Lazy-loaded attribute access after commit / outside active load | DetachedInstanceError or hidden sync IO |
| New session inside route body | Hard to test, breaks transaction boundaries |
| Returning ORM models from APIs | Leaks internals, unstable JSON, accidental lazy load |

## Minimal Patterns

**Query with relationship:**

```python
from sqlalchemy import select
from sqlalchemy.orm import selectinload

stmt = (
    select(Parent)
    .options(selectinload(Parent.children))
    .where(Parent.id == parent_id)
)
result = await session.execute(stmt)
parent = result.scalar_one()
```

**Service transaction:**

```python
async def create_item(session: AsyncSession, data: ItemCreate) -> Item:
    item = Item(**data.model_dump())
    session.add(item)
    try:
        await session.commit()
        await session.refresh(item)
    except Exception:
        await session.rollback()
        raise
    return item
```

**Bulk insert (Core, multi-row):**

```python
from sqlalchemy import insert

await session.execute(insert(items_table), rows)  # rows: list[dict] — one executemany
await session.commit()
```

For large batches, prefer Core `insert()` + parameter list (or the project’s chosen bulk API) over a Python loop of single-row inserts.

(Adjust table vs ORM bulk APIs to match project conventions.)

## Cross-Reference

- Endpoint-level rules also appear in the API endpoint pattern skill; this skill is the **database-layer** source of truth for async SQLAlchemy.
