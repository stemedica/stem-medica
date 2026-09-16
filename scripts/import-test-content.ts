import { readFile, readdir } from "node:fs/promises";
import { parseEnv } from "node:util";
import { isDeepStrictEqual } from "node:util";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { randomUUID } from "node:crypto";
import { catalogueSchema, savedDraftSchema } from "../src/lib/cms-schema";
import { postsSchema } from "../src/lib/post-schema";
import { contentDocuments } from "../src/lib/content-schema";
import { readJson, writeJson, listObjects, deleteObject, ConflictError } from "../src/lib/storage";
import { contentDatabase } from "../src/lib/content-database";

async function main() {
  if (process.env.VERCEL || !process.argv.includes("--confirm-test-branch")) throw new Error("Explicit test-branch confirmation required.");
  const env = parseEnv(await readFile(".env.neon-test", "utf8"));
  const direct = env.DATABASE_URL_UNPOOLED;
  const expectedHost = process.env.EXPECTED_TEST_DATABASE_HOST;
  if (!direct || !expectedHost || new URL(direct).hostname !== expectedHost || expectedHost.includes("-pooler") || !expectedHost.endsWith(".neon.tech")) throw new Error("Test branch identity does not match.");
  if (env.NEON_BRANCH !== "test/cms-preview" || !env.DATABASE_URL || new URL(env.DATABASE_URL).hostname.replace("-pooler", "") !== expectedHost) throw new Error("Pooled connection must match the test branch.");
  process.env.CMS_DATABASE_URL = env.DATABASE_URL;
  process.env.CONTENT_STORAGE_DRIVER = "postgres";
  const entries: { key: string; data: unknown }[] = [];
  for (const prefix of ["catalogue", "posts", "catalogue-history", "drafts"]) {
    const files = await readdir(`.local-storage/${prefix}`).catch((error: NodeJS.ErrnoException) => { if (error.code === "ENOENT") return []; throw error; });
    for (const file of files) {
      if (!file.endsWith(".json")) throw new Error("Unexpected local file; stop saves before importing.");
      const data: unknown = JSON.parse(await readFile(`.local-storage/${prefix}/${file}`, "utf8"));
      if (prefix === "posts") postsSchema.parse(data);
      else if (prefix === "drafts") savedDraftSchema.parse(data);
      else catalogueSchema.parse(data);
      entries.push({ key: `${prefix}/${file}`, data });
    }
  }
  if (!entries.some(e => e.key === "catalogue/current.json") || !entries.some(e => e.key === "posts/current.json")) throw new Error("Expected local content is missing.");
  const pool = new Pool({ connectionString: direct, max: 1, connectionTimeoutMillis: 10000 });
  try {
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: "./drizzle-content", migrationsSchema: "content_migrations" });
    // Atomic, repeatable import. Never overwrite different destination content.
    await db.transaction(async tx => {
      for (const entry of entries) {
        await tx.insert(contentDocuments).values({ ...entry, revision: randomUUID() }).onConflictDoNothing();
      }
      const rows = await tx.select().from(contentDocuments);
      for (const entry of entries) {
        if (!isDeepStrictEqual(rows.find(r => r.key === entry.key)?.data, entry.data)) throw new Error("Destination differs; import rolled back.");
      }
    });
    for (const entry of entries) {
      if (!isDeepStrictEqual((await readJson(entry.key))?.data, entry.data)) throw new Error("Read-back verification failed.");
    }
    // Verify actual storage behavior on disposable records, never user documents.
    const key = `catalogue-history/qa-${randomUUID()}.json`;
    try {
      const revision = await writeJson(key, { version: 1 });
      const writes = await Promise.allSettled([writeJson(key, { version: 2 }, revision), writeJson(key, { version: 3 }, revision)]);
      if (writes.filter(r => r.status === "fulfilled").length !== 1 || !writes.some(r => r.status === "rejected" && r.reason instanceof ConflictError)) throw new Error("Concurrent-write protection failed.");
      if (!(await listObjects("catalogue-history/")).some(r => r.pathname === key)) throw new Error("Listing failed.");
      let rejected = false;
      try { await deleteObject(key, revision); } catch (error) { if (error instanceof ConflictError) rejected = true; else throw error; }
      if (!rejected) throw new Error("Stale deletion was not blocked.");
    } finally {
      const saved = await readJson(key);
      if (saved) await deleteObject(key, saved.etag);
    }
    console.log(`Imported and verified ${entries.length} documents. Database reads, concurrent saves, listing and guarded deletion passed. Local files unchanged.`);
  } finally { await pool.end(); await contentDatabase().pool.end(); }
}
main().catch((error: unknown) => {
  const failure = error as { name?: string; code?: string; cause?: { code?: string } };
  console.error("Test content import failed.", { type: failure.name, code: failure.code, causeCode: failure.cause?.code });
  console.error("No local data was removed; destination conflicts are not overwritten. Credentials are not logged.");
  process.exitCode = 1;
});
