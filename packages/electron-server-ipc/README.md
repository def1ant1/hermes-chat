# @hermeslabs/electron-server-ipc

IPC (Inter-Process Communication) module between Hermes Labs' Electron application and server, providing reliable cross-process communication capabilities.

> \[!IMPORTANT] Hermes Labs Scope Migration
>
> - **Effective date:** 2025-03-31 – install this package via `npm install @hermeslabs/electron-server-ipc` to align with the new enterprise scope.
> - **Compatibility window:** We publish shim releases to `@hermeslabs/electron-server-ipc` until 2025-09-30, after which installs from the legacy scope will fail.
> - **Rollback path:** Follow the [official rollback procedure](https://github.com/hermeslabs/hermes-chat/blob/main/docs/development/rebranding.md#rollback-strategy) if a release train must temporarily revert to the former naming.
> - **Breaking-change watch-outs:** Electron apps that hardcode IPC handler names in preload scripts should update imports and rebuild artifacts before promoting to production.

## 📝 Introduction

`@hermeslabs/electron-server-ipc` is a core component of Hermes Chat's desktop application, responsible for handling communication between the Electron main process and Next.js server. It provides a simple yet robust API for passing data and executing remote method calls across different processes.

## 🛠️ Core Features

- **Reliable IPC Communication**: Socket-based communication mechanism ensuring stability and reliability of cross-process communication
- **Automatic Reconnection**: Client features automatic reconnection functionality to improve application stability
- **Type Safety**: Uses TypeScript to provide complete type definitions, ensuring type safety for API calls
- **Cross-Platform Support**: Supports Windows, macOS, and Linux platforms

## 🧩 Core Components

### IPC Server (ElectronIPCServer)

Responsible for listening to client requests and responding, typically runs in Electron's main process:

```typescript
import { ElectronIPCEventHandler, ElectronIPCServer } from '@hermeslabs/electron-server-ipc';

// Define handler functions
const eventHandler: ElectronIPCEventHandler = {
  getDatabasePath: async () => {
    return '/path/to/database';
  },
  // Other handler functions...
};

// Create and start server
const server = new ElectronIPCServer(eventHandler);
server.start();
```

### IPC Client (ElectronIpcClient)

Responsible for connecting to the server and sending requests, typically used in the server (such as Next.js service):

```typescript
import { ElectronIPCMethods, ElectronIpcClient } from '@hermeslabs/electron-server-ipc';

// Create client
const client = new ElectronIpcClient();

// Send request
const dbPath = await client.sendRequest(ElectronIPCMethods.getDatabasePath);
```

## 🤝 Contribution

IPC server implementations need to handle various communication scenarios and edge cases. We welcome community contributions to enhance reliability and functionality. You can participate in improvements through:

### How to Contribute

1. **Performance Optimization**: Improve IPC communication speed and reliability
2. **Error Handling**: Enhance error recovery and reconnection mechanisms
3. **New Features**: Add support for new IPC methods or communication patterns
4. **Documentation**: Improve code documentation and usage examples

### Contribution Process

1. Fork the [Hermes Chat repository](https://github.com/hermeslabs/hermes-chat)
2. Implement your improvements to the IPC server package
3. Submit a Pull Request describing:

- Performance improvements or new features
- Testing methodology and results
- Compatibility considerations
- Usage examples

## 📌 Note

This is an internal module of Hermes Labs (`"private": true`), designed specifically for Hermes Chat desktop applications and not published as a standalone package.
