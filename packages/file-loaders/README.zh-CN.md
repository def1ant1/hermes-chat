# @hermeslabs/file-loaders (Global Edition)

Enterprise deployments of Hermes Chat rely on this package to ingest, normalize, and index files from diverse sources before the data is surfaced in conversations.

> \[!IMPORTANT] Hermes Labs Scope Migration
>
> - **Effective date:** 2025-03-31 – install via `npm install @hermeslabs/file-loaders` to remain within the supported namespace.
> - **Compatibility window:** `@hermeslabs/file-loaders` compatibility builds remain available through 2025-09-30 for phased migrations.
> - **Rollback path:** Follow the [rebranding rollback guidance](https://github.com/hermeslabs/hermes-chat/blob/main/docs/development/rebranding.md#rollback-strategy) to revert to the legacy scope if a regression is detected during rollout.
> - **Breaking-change considerations:** Automated ingestion pipelines that pin the legacy scope must be updated in lockstep with application deployments to prevent job failures.

## Overview

`@hermeslabs/file-loaders` exposes helpers that parse and transform files into embeddings-ready content. The package prioritizes deterministic processing so that knowledge bases remain stable across deployments.

## Supported Loaders

- **PDF Loader:** Converts PDF documents into structured text segments while preserving headings for downstream summarization.
- **Markdown Loader:** Parses Markdown files, flattens embedded assets, and resolves relative links for knowledge ingestion.
- **HTML Loader:** Sanitizes and normalizes HTML content to strip scripts while maintaining semantic structure.
- **Text Loader:** Provides efficient streaming support for large plain-text files.

## Usage Example

```typescript
import { loadFileAsDocuments } from '@hermeslabs/file-loaders';

const documents = await loadFileAsDocuments({
  filePath: '/data/enterprise-handbook.pdf',
  loader: 'pdf',
  metadata: {
    classification: 'internal',
    retention: '2025-12-31',
  },
});
```

## 🤝 Contributing

Contributions that expand format coverage, improve parsing fidelity, or automate QA are encouraged.

### How to Contribute

1. **Bug Reports:** Flag parsing regressions or data quality issues.
2. **Feature Requests:** Suggest new loader types or metadata automation.
3. **Code Contributions:** Submit enhancements with benchmarks or validation scripts.

### Contribution Workflow

1. Fork the [Hermes Chat repository](https://github.com/hermeslabs/hermes-chat).
2. Implement and document your loader improvements.
3. Open a Pull Request summarizing:

- The problem solved
- Implementation details
- Test strategy and datasets
- Impact on existing pipelines

## 📌 Note

This module is marked `"private": true` and is distributed with Hermes Chat as part of the enterprise toolchain.
