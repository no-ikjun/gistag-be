import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from './schema';

export type AppDatabase = NodePgDatabase<typeof schema>;

export * from './database.constants';
export * from './schema';
