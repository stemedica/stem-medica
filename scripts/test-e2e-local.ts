import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import { mkdtemp, rm, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { insertAdmin } from "../src/lib/auth";

// Stop the normal dev server first: Next dev uses one workspace lock.
async function main() {
  const dir = await mkdtemp(path.join(tmpdir(), "stem-medica-e2e-"));
  const container = `stem-medica-e2e-${process.pid}`;
  let server: ChildProcess | undefined;
  let created = false;
  try {
    const postgresPassword = randomBytes(24).toString("hex");
    execFileSync("docker", ["run", "--rm", "-d", "--name", container, "-e", `POSTGRES_PASSWORD=${postgresPassword}`, "-e", "POSTGRES_DB=stem_medica_auth_qa", "-p", "127.0.0.1:55441:5432", "--tmpfs", "/var/lib/postgresql/data", "postgres:16-alpine"], { stdio: "pipe" });
    created = true;
    const dbURL = `postgresql://postgres:${postgresPassword}@127.0.0.1:55441/stem_medica_auth_qa`;
    const pool = new Pool({ connectionString: dbURL, connectionTimeoutMillis: 1000 });
    try {
      for (let i = 0; ; i++) {
        try { await pool.query("SELECT 1"); break; } catch { if (i > 20) throw new Error("Test database did not start"); await new Promise((r) => setTimeout(r, 500)); }
      }
      await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
      await insertAdmin(pool, "admin@example.test", "Test12345!", "Test admin");
    } finally { await pool.end(); }
    const env = { ...process.env, NODE_ENV: "development" as const, VERCEL: "", DATABASE_URL: dbURL, DATABASE_URL_UNPOOLED: dbURL,
      STORAGE_DRIVER: "local", CONTENT_STORAGE_DRIVER: "", LOCAL_STORAGE_DIR: path.join(dir, "storage"), QA_STORAGE_DIR: path.join(dir, "storage"),
      CRON_SECRET: "local-test-only", QA_AUTH_E2E: "1", QA_STORAGE_STATE: path.join(dir, "session.json") };
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "3001"], { env, stdio: "inherit", detached: true });
    for (let i = 0; ; i++) {
      if (server.exitCode !== null) throw new Error("Test server exited; stop your normal dev server first");
      try { if ((await fetch("http://127.0.0.1:3001/auth/login")).ok) break; } catch { /* wait for startup */ }
      if (i > 60) throw new Error("Test server did not become ready");
      await new Promise((r) => setTimeout(r, 500));
    }
    const run = (files: string[]) => new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, ["node_modules/@playwright/test/cli.js", "test", ...files], { env, stdio: "inherit" });
      child.on("error", reject); child.on("exit", (code) => code === 0 ? resolve() : reject(new Error("Browser tests failed")));
    });
    await run(["tests/auth.spec.ts"]);
    await chmod(env.QA_STORAGE_STATE, 0o600);
    const requested = process.argv.slice(2);
    await run(requested.length ? requested : ["tests/admin-dashboard.spec.ts", "tests/cms.spec.ts", "tests/posts.spec.ts", "tests/catalogue-picker.spec.ts", "tests/modals.spec.ts", "tests/history-navigation.spec.ts", "tests/save-actions.spec.ts", "tests/validation.spec.ts", "tests/duplicates.spec.ts", "tests/publication.spec.ts", "tests/public-ux.spec.ts"]);
  } finally {
    if (server?.pid && server.exitCode === null) { try { process.kill(-server.pid, "SIGTERM"); } catch { /* already exited */ } }
    if (created) execFileSync("docker", ["stop", container], { stdio: "pipe" });
    await rm(dir, { recursive: true, force: true });
    console.log("Disposed of this run’s database, temporary CMS files and test session. Neon was not changed.");
  }
}
main().catch(() => { console.error("Isolated browser verification failed. See test results above; no database credentials are logged."); process.exitCode = 1; });
