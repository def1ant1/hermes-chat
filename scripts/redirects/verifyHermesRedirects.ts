#!/usr/bin/env tsx
import { exit } from 'node:process';

import {
  HERMES_DOMAIN_LEGACY_HOSTS,
  HERMES_DOMAIN_REDIRECT_ANALYTICS_PARAMS,
  HERMES_DOMAIN_REDIRECT_RULES,
  HERMES_DOMAIN_REDIRECT_TOTAL,
  HermesDomainRedirectRule,
} from '@/config/redirects/hermesDomains';

interface Summary {
  categories: Record<string, number>;
  hosts: Record<string, { category: string; count: number }>;
  total: number;
}

const requiredAnalyticsKeys = Object.keys(HERMES_DOMAIN_REDIRECT_ANALYTICS_PARAMS);

const main = () => {
  const duplicateKeys = new Map<string, HermesDomainRedirectRule>();
  const hosts = new Map<string, { category: string; count: number }>();
  const categoryCounts = new Map<string, number>();

  for (const rule of HERMES_DOMAIN_REDIRECT_RULES) {
    const key = `${rule.legacyHost}::${rule.legacyPath}`;

    if (duplicateKeys.has(key)) {
      throw new Error(`Duplicate redirect rule detected for ${key}`);
    }

    duplicateKeys.set(key, rule);

    const hostEntry = hosts.get(rule.legacyHost) ?? { category: rule.category, count: 0 };
    hostEntry.count += 1;
    hosts.set(rule.legacyHost, hostEntry);

    categoryCounts.set(rule.category, (categoryCounts.get(rule.category) ?? 0) + 1);

    for (const analyticKey of requiredAnalyticsKeys) {
      if (!(analyticKey in rule.analytics)) {
        throw new Error(`Missing analytics key "${analyticKey}" for ${key}`);
      }
    }

    if (!rule.destinationPath.startsWith('/')) {
      throw new Error(`Destination path for ${key} must start with "/"`);
    }
  }

  if (HERMES_DOMAIN_REDIRECT_TOTAL !== HERMES_DOMAIN_REDIRECT_RULES.length) {
    throw new Error(
      `Redirect total constant (${HERMES_DOMAIN_REDIRECT_TOTAL}) does not match rule array length (${HERMES_DOMAIN_REDIRECT_RULES.length})`,
    );
  }

  if (HERMES_DOMAIN_LEGACY_HOSTS.size !== hosts.size) {
    throw new Error(
      `Legacy host catalogue mismatch: expected ${HERMES_DOMAIN_LEGACY_HOSTS.size} hosts but found ${hosts.size} entries in rules`,
    );
  }

  const categoryHostCounts = new Map<string, number>();
  for (const [, value] of hosts) {
    categoryHostCounts.set(value.category, (categoryHostCounts.get(value.category) ?? 0) + 1);
  }

  for (const [category, hostCount] of categoryHostCounts.entries()) {
    const totalForCategory = categoryCounts.get(category) ?? 0;
    const expectedPerHost = totalForCategory / hostCount;

    for (const [host, info] of hosts.entries()) {
      if (info.category !== category) continue;

      if (info.count !== expectedPerHost) {
        throw new Error(
          `Host ${host} has ${info.count} redirects but category "${category}" expects ${expectedPerHost} entries per host`,
        );
      }
    }
  }

  const summary: Summary = {
    categories: Object.fromEntries(categoryCounts.entries()),
    hosts: Object.fromEntries(hosts.entries()),
    total: HERMES_DOMAIN_REDIRECT_TOTAL,
  };

  const wantsJson = process.argv.includes('--format=json');

  if (wantsJson) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log('[verify-redirects] Hermes redirect catalogue validated');
    console.log(`  Total rules: ${summary.total}`);
    for (const [category, count] of Object.entries(summary.categories)) {
      console.log(`  ${category} rules: ${count}`);
    }
  }
};

try {
  main();
  exit(0);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[verify-redirects] ${message}`);
  exit(1);
}
