import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function main() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString || new URL(connectionString).hostname.includes("-pooler")) throw new Error("Set DATABASE_URL_UNPOOLED to a direct connection. Test on a development branch before production.");
  if (process.env.AUTH_MIGRATION_CONFIRM !== "apply") throw new Error("Review the migration, then set AUTH_MIGRATION_CONFIRM=apply.");
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10000 });
  try { await migrate(drizzle(pool), { migrationsFolder: "./drizzle" }); console.log("Authentication migrations applied."); }
  finally { await pool.end(); }
}
main().catch(() => { console.error("Migration failed. Check the direct connection, confirmation, and database availability. No credentials are logged."); process.exitCode = 1; });
