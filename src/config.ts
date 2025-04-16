import type { MigrationConfig } from 'drizzle-orm/migrator';

process.loadEnvFile();

type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
};

type APIConfig = {
    fileserverHits: number;
    dbURL: string, 
    db: DBConfig;
}
const migrationConfig: MigrationConfig = {
  migrationsFolder: './src/db/migrations',
};


const config:APIConfig = {
    db: {
        url: process.env.DATABASE_URL || "",
        migrationConfig,
      },
    fileserverHits: 0, 
    dbURL: process.env.DB_URL || ""
};

export default config;
