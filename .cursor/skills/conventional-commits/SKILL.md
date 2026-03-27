---
name: conventional-commits
description: Enforces Conventional Commits for this repository with required scopes and strict formatting rules. Use when writing, reviewing, or validating git commit messages, including before `git commit` and during PR cleanup.
---

# Conventional Commits

## Purpose

Generate and validate commit messages in this exact format:

`type(scope): short description`

Scope is required in every commit message.

## Allowed Types

- `feat`
- `fix`
- `docs`
- `refactor`
- `perf`
- `test`
- `chore`

## Allowed Scopes

- `api1`
- `api2`
- `api3`
- `e3n`
- `electron`
- `db`
- `ci`
- `shared`
- `ipc`

## Required Rules

1. Use imperative mood in the description (for example: `add`, `fix`, `update`, `move`).
2. Use lowercase for type, scope, and description.
3. Do not end the description with a period.
4. Keep the full commit subject line at 72 characters or fewer.
5. Always include a scope; never omit it.
6. Any E3N-related change must use scope `e3n`.

## Validation Workflow

When asked to write or review a commit message:

1. Infer the correct `type` from intent:
   - new behavior -> `feat`
   - bug fix -> `fix`
   - docs-only change -> `docs`
   - internal code restructure without behavior change -> `refactor`
   - performance improvement -> `perf`
   - test-only change -> `test`
   - tooling/maintenance -> `chore`
2. Infer the required scope from changed area.
3. If change touches E3N/Ollama/model-routing/inference, force scope to `e3n`.
4. Draft one concise subject line using `type(scope): short description`.
5. Validate all rules before finalizing.
6. If invalid, return a corrected message.

## Examples

- `feat(e3n): add ollama model fallback to claude api`
- `fix(api2): handle missing session in async sqlalchemy route`
- `refactor(electron): move fs calls from renderer to ipc main handler`
- `chore(ci): add python lint step to github actions workflow`
- `docs(shared): update e3n integration section with new model name`
- `perf(api3): replace lazy load with selectinload on user query`

## Rejection Conditions

Reject and correct commit messages that:

- omit scope, such as `feat: ...`
- use unsupported type or scope
- use uppercase text
- exceed 72 characters
- end with a period
- use non-`e3n` scope for E3N-related changes
