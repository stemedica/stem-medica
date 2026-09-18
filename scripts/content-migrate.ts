import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "node:url";

const migrationsFolder = fileURLToPath(new URL("../drizzle-content", import.meta.url));

async function main() {
  const connectionString = process.env.CMS_DATABASE_URL_UNPOOLED || process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString || new URL(connectionString).hostname.includes("-pooler")) throw new Error("A direct database connection is required.");
  if (process.env.CONTENT_MIGRATION_CONFIRM !== "apply") throw new Error("Review migrations and set CONTENT_MIGRATION_CONFIRM=apply.");
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10000 });
  try {
    await migrate(drizzle(pool), { migrationsFolder, migrationsSchema: "content_migrations" });
    console.log("CMS database migrations applied.");
  } finally { await pool.end(); }
}
main().catch((error: unknown) => {
  const failure = error as { name?: string; code?: string; cause?: { code?: string } };
  console.error("CMS migration failed. Check the direct connection and confirmation; credentials are not logged.", {
    type: failure.name,
    code: failure.code,
    causeCode: failure.cause?.code,
  });
  process.exitCode = 1;
});
