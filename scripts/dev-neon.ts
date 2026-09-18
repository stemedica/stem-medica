import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { spawn } from "node:child_process";

async function main() {
  const env = parseEnv(await readFile(".env.neon-test", "utf8"));
  if (!env.DATABASE_URL || !env.DATABASE_URL_UNPOOLED) throw new Error("Pull test branch credentials first.");
  if (env.NEON_BRANCH !== "test/cms-preview" || new URL(env.DATABASE_URL).hostname.replace("-pooler", "") !== new URL(env.DATABASE_URL_UNPOOLED).hostname) throw new Error("Expected matching test branch connections.");
  // Development auth and CMS share the isolated Neon branch, never production.
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", ...process.argv.slice(2)], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: env.DATABASE_URL, DATABASE_URL_UNPOOLED: env.DATABASE_URL_UNPOOLED,
      CMS_DATABASE_URL: env.DATABASE_URL, CONTENT_STORAGE_DRIVER: "postgres" },
  });
  for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => server.kill(signal));
  server.on("exit", code => { process.exitCode = code ?? 0; });
  server.on("error", () => { console.error("Preview server could not start."); process.exitCode = 1; });
}
main().catch(() => { console.error("Neon test preview could not start. Check .env.neon-test; no credentials are logged."); process.exitCode = 1; });
