import { readFile, writeFile, chmod } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const container = "stem-medica-local-auth";
const volume = "stem-medica-local-auth-data";
const owner = "com.stem-medica.purpose=local-auth";
const database = "stem_medica_local";
function docker(args: string[]) { return execFileSync("docker", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim(); }
async function main() {
  if (process.env.VERCEL) throw new Error("Local setup cannot run on Vercel");
  const source = await readFile(".env.local", "utf8").catch(() => "");
  const values = Object.fromEntries(source.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^([A-Z_]+)=(.*)$/); return match ? [[match[1], match[2].replace(/^"|"$/g, "")]] : [];
  }));
  if (values.DATABASE_URL && (new URL(values.DATABASE_URL).pathname !== `/${database}` || new URL(values.DATABASE_URL).hostname !== "127.0.0.1")) throw new Error("A different database is configured. Refusing to replace it automatically.");
  const existing = docker(["ps", "-a", "--filter", `name=^/${container}$`, "--format", "{{.Names}}"]);
  let url = values.DATABASE_URL;
  if (existing) {
    if (docker(["inspect", "--format", '{{index .Config.Labels "com.stem-medica.purpose"}}', container]) !== "local-auth") throw new Error("Container ownership does not match");
    if (!url || new URL(url).hostname !== "127.0.0.1" || new URL(url).port !== "55440") throw new Error("Existing local database requires its original environment configuration");
    docker(["start", container]);
  } else {
    if (docker(["volume", "ls", "--filter", `name=^${volume}$`, "--format", "{{.Name}}"])) throw new Error("An existing data volume needs manual recovery; it will not be overwritten");
    const password = randomBytes(32).toString("hex");
    url = `postgresql://postgres:${password}@127.0.0.1:55440/${database}`;
    docker(["run", "-d", "--name", container, "--label", owner, "--restart", "unless-stopped", "-e", `POSTGRES_PASSWORD=${password}`, "-e", `POSTGRES_DB=${database}`, "-p", "127.0.0.1:55440:5432", "-v", `${volume}:/var/lib/postgresql/data`, "postgres:16-alpine"]);
  }
  const updated = {
    DATABASE_URL: url!, DATABASE_URL_UNPOOLED: url!,
    BETTER_AUTH_SECRET: values.BETTER_AUTH_SECRET || randomBytes(48).toString("hex"),
    BETTER_AUTH_URL: "http://localhost:3000", ADMIN_EMAILS: values.ADMIN_EMAILS || "natinael.96@gmail.com",
    LOCAL_AUTH_SETUP: "1", STORAGE_DRIVER: "local",
  };
  const replaced = new Set([...Object.keys(updated), "ADMIN_USER", "ADMIN_PASSWORD", "ADMIN_AUTH_MODE"]);
  const kept = source.split(/\r?\n/).filter((line) => !replaced.has(line.match(/^([A-Z_]+)=/)?.[1] ?? "")).join("\n").trim();
  // Local environment generation is intentional; unrelated settings are preserved.
  await writeFile(".env.local", `${kept}\n\n# Persistent local admin; never production credentials.\n${Object.entries(updated).map(([key, value]) => `${key}=${value}`).join("\n")}\n`, { mode: 0o600 });
  await chmod(".env.local", 0o600);
  const pool = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 1000 });
  try {
    for (let attempt = 0; ; attempt++) {
      try { await pool.query("SELECT 1"); break; }
      catch { if (attempt >= 20) throw new Error("Local database did not become ready"); await new Promise((resolve) => setTimeout(resolve, 500)); }
    }
    await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
    const result = await pool.query("SELECT count(*)::int AS count FROM auth_user");
    console.log(`Local database ready (${result.rows[0].count} admin accounts). Existing data preserved.`);
    console.log("Run npm run dev, then open http://localhost:3000/auth/login to create your account or sign in.");
  } finally { await pool.end(); }
}
main().catch((error) => {
  // Do not print command errors: Docker command arguments can contain credentials.
  console.error(error instanceof Error && !('stderr' in error) ? error.message : "Local setup failed. Check that Docker is running and port 55440 is available. No existing data was deleted.");
  process.exitCode = 1;
});
