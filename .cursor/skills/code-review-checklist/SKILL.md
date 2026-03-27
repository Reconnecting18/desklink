---
name: code-review-checklist
description: >-
  Runs a pre-finalization mental checklist for code changes across general
  quality, TypeScript/Node, Python/SQLAlchemy, E3N/Ollama, and GitHub
  workflows. Requires `TODO` comments for any item that cannot be verified or
  satisfied. Use before completing a code change, pull request, or merge; when
  the user asks for a review checklist, pre-merge verification, or "run the
  checklist"; or when finalizing any implementation.
---

# Code Review Checklist

## When to apply

Before **finalizing** any code change (including the agent's own edits), run through this checklist mentally. If the change does not touch a section (for example, no Python in the diff), treat those items as **N/A** and skip them—do not add TODOs for N/A.

## Mandatory unfinished work

For any checklist item that **does not pass** and **cannot be fixed in the same change**, add a **TODO comment** at the relevant location (or at the top of the touched file if there is no single line). Use a short, actionable TODO that names what is missing.

Example:

`// TODO(code-review): add Zod schema for this route body`

Do **not** silently leave failed items undocumented.

---

## General

- [ ] Does this do exactly what was asked — no more, no less?
- [ ] Are all error cases handled explicitly? No bare `except` / `catch`.
- [ ] Is there duplicated logic that belongs in a shared utility?
- [ ] Are names (variables, functions, files) self-explanatory without a comment?
- [ ] Are there hardcoded values that should be constants or env vars?

## TypeScript / Node

- [ ] Is every `async` function properly `await`ed at every call site?
- [ ] Are Zod (or equivalent) validation schemas present at API boundaries?
- [ ] No Node.js APIs called directly in Electron renderer code?

## Python / SQLAlchemy

- [ ] Are all DB calls using `AsyncSession` with proper load strategies (`selectinload` / `joinedload` as needed)?
- [ ] Is the session closed after use (context manager or framework-managed lifecycle)?
- [ ] Are Pydantic schemas used for all inputs and outputs at boundaries?

## E3N / Ollama

- [ ] Is the model name sourced from config, not hardcoded?
- [ ] Is the offline/unavailable case handled?
- [ ] Is the prompt stored in `/prompts/`, not inline?

## GitHub

- [ ] Is the commit message conventional and scoped? (See `conventional-commits` skill for this repo.)
- [ ] Does `CLAUDE.md` still reflect reality after this change?
- [ ] Was a GitHub Issue created or closed if applicable?

## Related skills

- Conventional Commits and scopes: [conventional-commits](../conventional-commits/SKILL.md)
- API patterns and validation: [api-endpoint-pattern](../api-endpoint-pattern/SKILL.md)
- E3N integration: [e3n-integration](../e3n-integration/SKILL.md)
- Async SQLAlchemy: [sqlalchemy-async](../sqlalchemy-async/SKILL.md)
- Electron IPC / renderer safety: [electron-ipc](../electron-ipc/SKILL.md)
- Documentation: [documentation-maintenance-subagent](../documentation-maintenance-subagent/SKILL.md)
