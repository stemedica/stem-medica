/**
 * Run the local dev server against the PRODUCTION database and blob store.
 *
 * `npm run dev` deliberately uses the isolated test/cms-preview Neon branch.
 * This is the opt-in escape hatch for when you need to see real content
 * locally.
 *
 * Everything you do in the admin here is live. Saving the catalogue, editing a
 * post, uploading or deleting an image all change the public site immediately.
 * There is no staging copy and no undo.
 *
 *   npm run dev:prod
 */
import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";

const ENV_FILE = ".env.production.local";
const PRODUCTION_HOST = "ep-quiet-truth-b1alj0ud.c-5.eu-central-1.aws.neon.tech";

async function main() {
  let file: string;
  try {
    file = await readFile(ENV_FILE, "utf8");
  } catch {
    throw new Error(`${ENV_FILE} not found. Run: vercel env pull --environment=production ${ENV_FILE}`);
  }
  const env = parseEnv(file);
  const url = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
  if (!url) throw new Error(`${ENV_FILE} has no database connection.`);

  // Guard against this pointing somewhere unexpected after an env change.
  const host = new URL(url).hostname.replace("-pooler", "");
  if (host !== PRODUCTION_HOST) {
    throw new Error(`Refusing to start: ${ENV_FILE} points at ${host}, not the known production host.`);
  }

  if (process.env.DEV_PROD_CONFIRM !== "live") {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    console.warn(
      "\n  \x1b[41m\x1b[97m  LIVE PRODUCTION DATA  \x1b[0m\n" +
      "  Edits in the admin change the public site immediately.\n" +
      "  There is no staging copy and no undo.\n",
    );
    const answer = (await rl.question("  Type 'live' to continue: ")).trim();
    rl.close();
    if (answer !== "live") {
      console.log("  Cancelled. `npm run dev` uses the safe test branch.");
      return;
    }
  }

  const server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", ...process.argv.slice(2)],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: env.DATABASE_URL,
        DATABASE_URL_UNPOOLED: env.DATABASE_URL_UNPOOLED,
        CMS_DATABASE_URL: env.DATABASE_URL,
        CMS_DATABASE_URL_UNPOOLED: env.DATABASE_URL_UNPOOLED,
        CONTENT_STORAGE_DRIVER: "postgres",
        // Without this, media requests fall back to local disk and images 404.
        BLOB_READ_WRITE_TOKEN: env.BLOB_READ_WRITE_TOKEN,
        BLOB_STORE_ID: env.BLOB_STORE_ID,
        STORAGE_DRIVER: "blob",
        NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL,
      },
    },
  );
  for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => server.kill(signal));
  server.on("exit", (code) => { process.exitCode = code ?? 0; });
  server.on("error", () => { console.error("Server could not start."); process.exitCode = 1; });
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Could not start against production.");
  process.exitCode = 1;
});
