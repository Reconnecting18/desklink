---
name: api-endpoint-pattern
description: Enforces a consistent API endpoint implementation pattern across TypeScript/Node and Python/SQLAlchemy services, including RESTful routes, validation, service-layer separation, response envelope shape, logging, and safe error handling. Use when creating, modifying, or reviewing endpoints across any of the three APIs.
---

# API Endpoint Pattern

## When To Apply

Apply this skill whenever an endpoint is created, updated, refactored, or reviewed in any of the three APIs.

## Required Cross-API Response Contract

Use a uniform client-facing response envelope across all APIs.

- Success: `{ success: true, data: T, meta?: object }`
- Error: `{ success: false, error: string, code: string }`

Never expose stack traces, internal file paths, or raw backend exception details in client responses.

## TypeScript/Node Endpoint Rules

For every route:

1. Use RESTful, resource-based paths (`/users/:id`, not `/getUserById`).
2. Validate input at the route boundary using `zod` or equivalent; reject invalid input immediately.
3. Keep business logic in a separate service module; do not inline business logic in route handlers.
4. Return the standard success/error response envelope.
5. Add JSDoc on each route with:
   - `@description`
   - `@param`
   - `@returns`
   - `@throws`
6. Log entry and exit for each request at info level:
   - Entry: request metadata
   - Exit: result summary and status code
7. Sanitize error responses; do not leak internals.

## Python/SQLAlchemy Endpoint Rules

For every endpoint:

1. Use dependency-injected `AsyncSession` for all DB operations.
2. Eager-load relationships via `selectinload`/`joinedload`; never depend on lazy loading.
3. Explicitly commit or roll back sessions; never assume auto-commit.
4. Use Pydantic schemas for all request and response bodies.
5. Return the same standard success/error response envelope.
6. Sanitize error responses; do not leak internals.

## Endpoint Implementation Checklist

Copy and complete this checklist during endpoint work:

```text
Endpoint Pattern Checklist
- [ ] Route path is RESTful and resource-based
- [ ] Input validation runs at the route boundary
- [ ] Business logic lives in service layer (not route)
- [ ] Success response uses { success: true, data, meta? }
- [ ] Error response uses { success: false, error, code }
- [ ] Entry and exit info logs are present
- [ ] Errors are sanitized (no stack traces/internal paths/raw DB errors)
- [ ] (Python) AsyncSession is dependency-injected
- [ ] (Python) Relationship loading uses selectinload/joinedload
- [ ] (Python) Session commit/rollback is explicit
- [ ] (Python) Pydantic request/response schemas are used
- [ ] (TypeScript/Node) Route includes required JSDoc tags
```

## Review Heuristics

When reviewing endpoint changes:

1. Fail review if route naming is not RESTful.
2. Fail review if validation is missing or deferred past boundary.
3. Fail review if route handlers contain business logic.
4. Fail review if response shape diverges from standard envelope.
5. Fail review if logging or error sanitization is missing.
6. For Python, fail review if async session usage, eager loading, or transaction boundaries are incorrect.
