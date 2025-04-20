import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';
import config from '../config.js';

const conn = postgres(config.dbURL);
export const db = drizzle(conn, { schema });
const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);