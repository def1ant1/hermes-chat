# @hermeslabs/electron-server-ipc (Global Edition)

Hermes Chat's Electron applications rely on this package for resilient IPC (Inter-Process Communication) between the Electron main process and the Next.js backend runtime.

> \[!IMPORTANT] Hermes Labs Scope Migration
>
> - **Effective date:** 2025-03-31 – install via `npm install @hermeslabs/electron-server-ipc` to remain within the supported namespace.
> - **Compatibility window:** `@hermeslabs/electron-server-ipc` receives compatibility releases until 2025-09-30. Schedule cutovers before that date to avoid install failures once the legacy scope is retired.
> - **Rollback path:** The [rollback workflow](https://github.com/hermeslabs/hermes-chat/blob/main/docs/development/rebranding.md#rollback-strategy) allows you to revert within minutes if a production incident requires the legacy scope.
> - **Breaking-change considerations:** Audit preload scripts or build pipelines that hardcode the previous package name and rebuild your Electron artifacts after updating imports.

## 📝 Overview

`@hermeslabs/electron-server-ipc` is a foundational component for Hermes Chat's desktop experience. It provides a type-safe API surface to share data and execute remote procedures across processes.

## 🛠️ Core Capabilities

- **Reliable IPC Transport:** Socket-based communication with backpressure handling ensures consistent cross-process messaging.
- **Automated Recovery:** Built-in reconnect logic keeps sessions healthy during transient network or process disruptions.
- **Type Safety:** Comprehensive TypeScript definitions catch contract mismatches at build time.
- **Cross-Platform Delivery:** Validated on Windows, macOS, and Linux, making it ready for enterprise deployments.

## 🧩 Primary Components

### IPC Server (`ElectronIPCServer`)

Listens for renderer or backend requests and issues responses. It typically lives in the Electron main process:

```typescript
import { ElectronIPCEventHandler, ElectronIPCServer } from '@hermeslabs/electron-server-ipc';

const eventHandler: ElectronIPCEventHandler = {
  getDatabasePath: async () => {
    return '/path/to/database';
  },
  // Extend with additional handlers as your product grows.
};

const server = new ElectronIPCServer(eventHandler);
server.start();
```

### IPC Client (`ElectronIpcClient`)

Connects to the server and dispatches requests—commonly from a Next.js service or automation worker:

```typescript
import { ElectronIPCMethods, ElectronIpcClient } from '@hermeslabs/electron-server-ipc';

const client = new ElectronIpcClient();

const dbPath = await client.sendRequest(ElectronIPCMethods.getDatabasePath);
```

## 🤝 Contributing

Robust IPC requires constant tuning for throughput, security, and observability. Contributions focused on these dimensions are welcome.

### How to Contribute

1. **Performance Improvements:** Optimize transport throughput or latency.
2. **Error Handling:** Enhance retry policies, telemetry, or fallback behaviors.
3. **New Features:** Add IPC methods or new orchestration patterns.
4. **Documentation:** Expand guides and samples with enterprise deployment tips.

### Contribution Workflow

1. Fork the [Hermes Chat repository](https://github.com/hermeslabs/hermes-chat).
2. Implement and document your server-side IPC enhancements.
3. Submit a Pull Request describing:

- Performance or feature improvements
- Test strategy and results
- Compatibility considerations
- Usage demonstrations

## 📌 Note

This module is marked `"private": true` and is distributed only with Hermes Chat. It is not published as a standalone package.
