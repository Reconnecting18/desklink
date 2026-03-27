---
name: e3n-integration
description: Integrates E3N/Ollama safely in API and UI flows with explicit model configuration, structured fallbacks, logging, prompt management, input sanitization, response validation, and streaming-first responses. Use when building or reviewing AI inference routes, handlers, services, or E3N architecture decisions.
---

# E3N Integration

## Quick Start

Apply this skill whenever code sends user-driven input to E3N (Ollama), directly or indirectly.

Copy this checklist and complete each item:

```markdown
E3N Integration Checklist
- [ ] Use `e3nService.infer(prompt, options)` from handlers/routes
- [ ] Set model explicitly from config/env (no hardcoded model, no implicit default)
- [ ] Handle offline/unavailable Ollama with structured fallback response
- [ ] Log prompt summary, model, latency ms, token estimate (if available)
- [ ] Store prompts in `/prompts/` with version header comment
- [ ] Sanitize and structure user input before inference
- [ ] Validate E3N response shape before downstream use
- [ ] Prefer streaming for UI-facing responses
- [ ] Keep backend selection behind one routing function
```

## Non-Negotiable Rules

1. Never call Ollama inline in a route/handler. Routes call service-layer code only.
2. Pass model explicitly on every inference call.
3. Model value must come from config or environment, not hardcoded business logic.
4. Always return a structured fallback when Ollama is unavailable; never hang or leak raw 500 behavior.
5. Log each E3N call with:
   - prompt summary (redacted/high-level only, not full prompt),
   - model name,
   - inference duration in milliseconds,
   - approximate token count when available.
6. Keep prompt templates in `/prompts/` as `.txt` or `.md`, with a version comment at the top.
7. Never pass raw user strings directly to E3N; sanitize, normalize, and structure inputs first.
8. Validate and parse E3N response shape before use; reject malformed/partial payloads safely.
9. For UI-facing responses, prefer streaming mode over waiting for full completion.
10. Future multi-backend support (E3N + Claude fallback) must be selected in one routing function so callers stay backend-agnostic.

## Required Architecture Pattern

Use this layering:

- `route/handler` -> validates request and calls service
- `input-sanitizer` -> transforms raw user input into structured inference payload
- `prompt-loader` -> reads versioned templates from `/prompts/`
- `ai-router` -> selects backend/model (`e3n` today, fallback providers later)
- `e3nService` -> executes Ollama calls and returns normalized results
- `response-validator` -> validates returned shape before business logic/UI response

Routes and business logic must never know Ollama endpoint details.

## Implementation Guidance

### Service Boundary

- Expose one primary call shape such as `e3nService.infer(prompt, options)`.
- Keep timeout, retry, parsing, logging, and fallback behavior inside service/router layers.

### Model Selection

- Require model in `options`.
- Resolve model from config/env at composition time.
- Fail fast if model is missing or empty.

### Offline/Unavailable Handling

- Detect unreachable Ollama (connection refused, timeout, DNS/network errors).
- Return a structured fallback object (stable schema) with:
  - `status` (for example `fallback`),
  - `reason` (for example `ollama_unavailable`),
  - `message` (safe user-facing text),
  - optional `data` with defaults.
- Ensure fallback paths are bounded by timeout and never block indefinitely.

### Logging Requirements

- Use structured logs for each call:
  - `event: "e3n_infer"`
  - `model`
  - `prompt_summary`
  - `duration_ms`
  - `token_estimate` (nullable when unavailable)
  - `result_status` (`ok`, `fallback`, `invalid_response`, etc.)
- Do not log full prompt content or sensitive raw user data.

### Prompt Management

- Save templates under `/prompts/` as `.txt` or `.md`.
- First line must contain a version comment, for example:
  - `<!-- version: 1.0.0 -->` (md)
  - `# version: 1.0.0` (txt style comment if parser supports it)
- Load prompts by filename/version reference, not inline string literals in handlers/services.

### Input Sanitization

- Trim and normalize whitespace.
- Enforce type/length constraints.
- Strip or escape unsafe control sequences if relevant.
- Map raw fields into a typed internal structure before prompt rendering.

### Response Validation

- Treat model output as untrusted input.
- Parse JSON defensively.
- Validate expected keys/types with a schema validator.
- If invalid/partial, return structured fallback or error envelope without crashing downstream logic.

### Streaming for UI Responses

- Prefer Ollama generate stream mode for renderer/UI requests.
- Stream normalized chunks/events with consistent event schema.
- Include terminal event carrying final status/metadata.

### Backend Routing Function

- Centralize backend selection in one router function, for example `inferWithActiveBackend(...)`.
- All callers use router/service interfaces only.
- Adding Claude fallback later must require changes only in router/provider implementations.

## Review Heuristics

Reject changes if any of the following appears:

- Direct Ollama HTTP calls in route/handler files
- Hardcoded model literals in business logic
- Inline prompt bodies outside `/prompts/`
- Missing fallback path for offline inference
- Missing inference timing/model/prompt-summary logs
- Raw user input passed directly to inference
- Unvalidated JSON response consumption
- Non-streaming UI inference where streaming is feasible
- Backend-specific conditionals spread across feature code

## Minimal Output Contract

When implementing or reviewing E3N integration work, report:

1. Service entry point used (`e3nService.infer` or equivalent)
2. Model source (config/env key)
3. Fallback behavior and response envelope
4. Logging fields emitted
5. Prompt file path/version
6. Input sanitization performed
7. Response validation method/schema
8. Streaming behavior for UI paths
9. Backend routing abstraction status

E3N is the intelligence core; treat reliability and observability with production-database rigor.
