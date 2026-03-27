---
name: electron-ipc
description: Enforces secure Electron IPC boundaries using contextBridge-only APIs, typed channels, input validation, and structured error results. Use when creating, modifying, reviewing, or debugging Electron main/preload/renderer communication, BrowserWindow webPreferences, and IPC channel contracts.
---

# Electron IPC

## Purpose

Use this skill for every Electron-related change that touches IPC, preload, renderer API access, or `BrowserWindow` security settings.

## Non-Negotiable Security Baseline

1. `contextIsolation` must be `true`.
2. `nodeIntegration` must be `false`.
3. Never expose raw `ipcRenderer` to renderer code.
4. Expose only typed, named functions through `contextBridge.exposeInMainWorld` in `preload.ts`.

## IPC Channel Contract Rules

1. Channel names must follow `domain:action` (examples: `e3n:infer`, `file:read`, `window:minimize`).
2. Use `ipcMain.handle()` for request/response flows where renderer awaits a result.
3. Use `ipcMain.on()` only for fire-and-forget events with no response.
4. Validate all renderer-provided data in main handlers before use; renderer input is untrusted.
5. If a handler can fail, return:

```ts
type IpcResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

Do not rely on thrown errors as the renderer-facing contract.

## Required Implementation Order

When adding a new IPC channel, do this in order:

1. Define TypeScript request/response types first.
2. Implement and validate the handler in main.
3. Expose a typed function via `preload.ts` + `contextBridge.exposeInMainWorld`.
4. Consume the typed API in renderer.

## Documentation Requirement

Every IPC channel must be documented in `CLAUDE.md` with:

- Channel name
- Direction (`main→renderer` or `renderer→main`)
- Request payload type
- Response payload type

If you add, rename, or remove channels, update `CLAUDE.md` in the same change.

## Review Checklist

Use this checklist before finishing Electron IPC changes:

- [ ] `contextIsolation: true` and `nodeIntegration: false` are enforced.
- [ ] No renderer code imports or receives raw `ipcRenderer`.
- [ ] Channel naming follows `domain:action`.
- [ ] Main handlers validate renderer input.
- [ ] Request/response channels use `ipcMain.handle`.
- [ ] Fire-and-forget channels use `ipcMain.on` only when no response is needed.
- [ ] Failable handlers return `{ success, data?, error? }`.
- [ ] `CLAUDE.md` channel docs are complete and updated.
