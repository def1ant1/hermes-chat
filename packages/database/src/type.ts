import type { NeonDatabase } from 'drizzle-orm/neon-serverless';

import * as schema from './schemas';

export type HermesChatDatabaseSchema = typeof schema;

export type HermesChatDatabase = NeonDatabase<HermesChatDatabaseSchema>;

export type Transaction = Parameters<Parameters<HermesChatDatabase['transaction']>[0]>[0];
