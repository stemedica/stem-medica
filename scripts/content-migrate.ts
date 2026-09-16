import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function main() {
  const connectionString = process.env.CMS_DATABASE_URL_UNPOOLED || process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString || new URL(connectionString).hostname.includes("-pooler")) throw new Error("A direct database connection is required.");
  if (process.env.CONTENT_MIGRATION_CONFIRM !== "apply") throw new Error("Review migrations and set CONTENT_MIGRATION_CONFIRM=apply.");
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10000 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: "./drizzle-content", migrationsSchema: "content_migrations" });
    console.log("CMS database migrations applied.");
  } finally { await pool.end(); }
}
main().catch(() => { console.error("CMS migration failed. Check the direct connection and confirmation; credentials are not logged."); process.exitCode = 1; });
