import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { Pool } from "pg";

async function main() {
  if (process.env.VERCEL || !process.argv.includes("--confirm-test-branch")) throw new Error("Explicit test-branch confirmation required.");
  const env = parseEnv(await readFile(".env.neon-test", "utf8"));
  const url = env.DATABASE_URL_UNPOOLED;
  if (!url || env.NEON_BRANCH !== "test/cms-preview") throw new Error("Test branch identity is missing.");
  const host = new URL(url).hostname;
  if (host !== "ep-bitter-resonance-b15i9672.c-5.eu-central-1.aws.neon.tech") throw new Error("Refusing to clean an unexpected database host.");
  const pool = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 10_000, query_timeout: 15_000 });
  try {
    const before = await pool.query("SELECT count(*)::int AS count FROM content_document");
    await pool.query("BEGIN");
    try {
      await pool.query("TRUNCATE content_document");
      if ((await pool.query("SELECT to_regclass('public.auth_session') AS table_name")).rows[0]?.table_name) await pool.query("DELETE FROM auth_session");
      if ((await pool.query("SELECT to_regclass('public.auth_throttle') AS table_name")).rows[0]?.table_name) await pool.query("DELETE FROM auth_throttle");
      if ((await pool.query("SELECT to_regclass('public.enquiry') AS table_name")).rows[0]?.table_name) {
        await pool.query("TRUNCATE enquiry, enquiry_throttle");
      }
      await pool.query("COMMIT");
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
    const after = await pool.query("SELECT count(*)::int AS count FROM content_document");
    console.log(`Test branch cleaned: ${before.rows[0].count} content documents removed; ${after.rows[0].count} remain. Any separate admin account was left untouched.`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  const failure = error as { name?: string; code?: string };
  console.error("Test cleanup failed without exposing credentials.", { type: failure.name, code: failure.code });
  process.exitCode = 1;
});
