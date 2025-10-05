# @hermeslabs/web-crawler (Global Edition)

This package provides Hermes Chat with a compliant, rate-aware crawling engine for collecting public web content before enrichment and indexing.

> \[!IMPORTANT] Hermes Labs Scope Migration
>
> - **Effective date:** 2025-03-31 – install via `npm install @hermeslabs/web-crawler` to adopt the supported namespace.
> - **Compatibility window:** `@hermeslabs/web-crawler` receives compatibility updates through 2025-09-30 so you can roll out migrations gradually.
> - **Rollback path:** Use the [Hermes rebranding rollback guidance](https://github.com/hermeslabs/hermes-chat/blob/main/docs/development/rebranding.md#rollback-strategy) if a production incident requires reverting to the legacy package scope.
> - **Breaking-change considerations:** Infrastructure automation (CI/CD, container images, scheduler jobs) must update pinned dependencies concurrently to avoid crawl job failures.

## Overview

`@hermeslabs/web-crawler` is engineered to fetch, clean, and normalize web pages while respecting robots directives and tenant-specific rate limits.

## Key Features

- **Policy Compliance:** Honors robots.txt rules and domain-level restrictions.
- **Adaptive Rate Limiting:** Dynamically adjusts concurrency to respect provider SLAs.
- **Content Normalization:** Strips scripts, deduplicates whitespace, and extracts metadata for downstream processing.
- **Observability Hooks:** Emits structured logs and metrics for centralized monitoring platforms.

## Usage Example

```typescript
import { createCrawler } from '@hermeslabs/web-crawler';

const crawler = createCrawler({
  concurrency: 4,
  userAgent: 'HermesLabsBot/1.0',
});

await crawler.crawl('https://example.com/docs');
```

## 🤝 Contributing

We welcome improvements that enhance compliance, throughput, or developer experience.

### How to Contribute

1. **Bug Reports:** Document crawl failures, policy violations, or data quality issues.
2. **Feature Requests:** Propose new extraction strategies or scheduling capabilities.
3. **Code Contributions:** Submit pull requests with benchmarks, monitoring dashboards, or additional automation.

### Contribution Workflow

1. Fork the [Hermes Chat repository](https://github.com/hermeslabs/hermes-chat).
2. Implement and document your crawling enhancements.
3. Open a Pull Request including:

- The problem addressed
- Implementation notes
- Test coverage and validation results
- Operational considerations

## 📌 Note

This package is marked `"private": true` and is distributed exclusively with Hermes Chat for managed enterprise deployments.
