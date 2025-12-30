import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../server/.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

console.log('🔄 Running PostgreSQL migrations...');

// Create migration client
const migrationClient = postgres(connectionString, { max: 1 });
const db = drizzle(migrationClient);

// Run migrations
migrate(db, { migrationsFolder: path.join(__dirname, '../../../server/drizzle') })
  .then(() => {
    console.log('✅ Migrations complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
