import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function runMigrations() {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✅ Migrations completed");
  await pool.end();
}

runMigrations();