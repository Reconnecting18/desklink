---
name: project-context
description: Captures architecture and decision priorities for a solo-built multi-API Electron system with E3N/Ollama as the core intelligence layer. Use when planning features, implementing cross-service changes, reviewing architecture tradeoffs, or when the user asks for maintainability, modularity, security, cost, and documentation alignment.
---

# Project Context

## Quick Start

Apply this skill whenever work touches API boundaries, Electron IPC/security, E3N flows, shared packages, architecture decisions, or project documentation.

Copy this checklist and complete each item:

```markdown
Project Context Checklist
- [ ] Choose clarity over cleverness in naming, structure, and control flow
- [ ] Keep APIs modular; isolate changes to one service unless cross-service work is explicit
- [ ] Move duplicated cross-service logic into a shared package
- [ ] Preserve Electron security boundaries (`contextIsolation` on, no raw Node in renderer)
- [ ] Sanitize and validate all E3N/Ollama inputs and outputs
- [ ] Prefer Ollama-first inference paths; minimize Claude-dependent design assumptions
- [ ] Add caching where repeat requests are likely and correctness is preserved
- [ ] Update `CLAUDE.md` when behavior, contracts, or architecture changes
- [ ] Leave a clear TODO when deferring a complex version
```

## System Snapshot

- APIs 1 and 2: TypeScript/Node.js (Express-style services)
- API 3: Python with async SQLAlchemy (FastAPI-style services)
- Desktop app: Electron + TypeScript (`main`, `preload`, `renderer`)
- AI layer: E3N on Ollama (local); Claude integration planned, not active
- Delivery flow: GitHub Actions + GitHub Projects + GitHub PR workflow
- Team shape: solo developer optimizing for maintainability and return-to-context speed

## Decision Priorities (Strict Order)

1. Clarity over cleverness.
2. Modularity across APIs and layers.
3. Security, especially Electron IPC boundaries and AI input handling.
4. Cost efficiency with Ollama-first usage and aggressive safe caching.
5. Documentation accuracy, especially `CLAUDE.md`.

When tradeoffs conflict, choose the higher-priority rule.

## Non-Negotiable Rules

1. Prefer straightforward code over dense abstractions.
2. Do not couple APIs through hidden assumptions; use explicit contracts.
3. Shared behavior belongs in a shared package, not copy-pasted across APIs.
4. Keep `contextIsolation` enabled and expose renderer capabilities only via `contextBridge`.
5. Never expose raw Node.js APIs directly to renderer code.
6. Treat all E3N input and model output as untrusted; sanitize, bound, and validate.
7. Design AI routing so E3N remains swappable without widespread caller changes.
8. Optimize for local-first inference and minimal paid-provider dependence.
9. Keep docs in sync with behavior; stale docs are a bug.
10. If the robust version is deferred, leave an explicit TODO with scope and intent.

## Implementation Workflow

### 1) Define the Smallest Clear Change

- State the immediate goal in one sentence.
- Keep scope narrow enough to ship and understand quickly.
- Avoid speculative architecture unless required by current work.

### 2) Enforce Boundaries

- For API changes: keep route/handler, service, and data layers separated.
- For cross-API logic: extract to shared package with versioned usage.
- For Electron changes: keep privileged operations in main/preload, not renderer.

### 3) Protect the Intelligence Layer

- Keep E3N behind a stable service/router interface.
- Ensure input sanitization, timeout handling, and response validation.
- Avoid backend-specific logic leaking into feature code.

### 4) Optimize for Cost and Reliability

- Default to Ollama/local execution patterns.
- Add cache keys, TTL strategy, and invalidation notes where applicable.
- Log enough context to debug expensive or repeated inference paths.

### 5) Document Before Closing

- Update `CLAUDE.md` for changed architecture, contracts, IPC channels, or runbooks.
- Record deferred complexity with clear TODOs and decision rationale.
- Prefer short, explicit notes over broad prose.

## Review Heuristics

Flag or reject changes that introduce:

- Clever but hard-to-follow control flow
- Tight coupling between APIs without explicit shared contracts
- Renderer access to Node APIs or weakened IPC security boundaries
- Unsanitized E3N prompts or unvalidated model responses
- Paid-provider assumptions in core paths before local-first options
- Missing docs updates for behavior or architecture changes
- Complex rewrites without a simple intermediate step

## Default Guidance for Ambiguity

When uncertain:

1. Build the simple version first.
2. Document what was chosen and why.
3. Leave a precise TODO for the advanced version later.

E3N is the core intelligence layer: protect it, abstract it, and keep it swappable.
