# @hermeslabs/electron-client-ipc (Global Edition)

This package ships the client utilities Hermes Chat uses to orchestrate IPC (Inter-Process Communication) flows within the Electron renderer runtime.

> \[!IMPORTANT] Hermes Labs Scope Migration
>
> - **Effective date:** 2025-03-31 – install via `npm install @hermeslabs/electron-client-ipc` to stay aligned with the supported namespace.
> - **Compatibility window:** Compatibility releases for `@lobechat/electron-client-ipc` remain available through 2025-09-30; complete all production cutovers before the window closes.
> - **Rollback path:** Reference the [Hermes rebranding rollback guidance](https://github.com/hermeslabs/hermes-chat/blob/main/docs/development/rebranding.md#rollback-strategy) if you need to revert under an incident SLA.
> - **Breaking-change considerations:** Renderer bundles that tree-shake by package scope require cache invalidation and a fresh build when you transition to `@hermeslabs/*` imports.

## Overview

In Electron applications, IPC acts as the conduit between the Main Process, Renderer Process, and the Next.js service layer. To keep the architecture modular, we split our IPC tooling into two packages:

- `@hermeslabs/electron-client-ipc`: **Renderer-focused IPC toolkit**
- `@hermeslabs/electron-server-ipc`: **Server and main-process IPC toolkit**

## Responsibilities

### electron-client-ipc (this package)

- Runtime: Renderer Process
- Core duties:
  - Expose strongly typed APIs for renderer components to invoke main-process operations
  - Wrap `ipcRenderer.invoke` helpers with retry-aware ergonomics
  - Manage request lifecycles when communicating with the main process

### electron-server-ipc

- Runtime: Electron main process and Next.js backend
- Core duties:
  - Provide the socket-based transport used across processes
  - Implement the `ElectronIPCServer` and `ElectronIpcClient` coordination primitives
  - Handle cross-process request/response routing
  - Supply automatic reconnection and fault handling hooks
  - Guarantee type-safe contracts between renderer and server

## When to Use This Package

Use the client IPC helpers whenever the renderer needs to:

- Access privileged operating-system APIs
- Perform file I/O or other main-process mediated actions
- Trigger features that live exclusively in the main process

## Technical Notes

The split-package architecture honors separation of concerns, which means:

- IPC interfaces remain maintainable and easy to audit
- Renderer and server codebases stay decoupled
- Shared TypeScript definitions prevent drift across processes

## 🤝 Contributing

IPC requirements vary widely across enterprise deployments. Contributions that improve reliability, resilience, or developer experience are encouraged.

### How to Contribute

1. **Bug Reports:** Surface issues with IPC communication, type definitions, or reconnection behavior
2. **Feature Requests:** Propose additional IPC methods or ergonomic improvements
3. **Code Contributions:** Submit pull requests with fixes, enhancements, or new automation helpers

### Contribution Workflow

1. Fork the [Hermes Chat repository](https://github.com/hermeslabs/hermes-chat)
2. Implement and document your renderer-side IPC improvements
3. Open a Pull Request outlining:

- The problem addressed
- Implementation details
- Test coverage or usage demonstrations
- Impact on existing features

## 📌 Note

This module is marked `"private": true` and ships exclusively with Hermes Chat. It is not published as a standalone package.
