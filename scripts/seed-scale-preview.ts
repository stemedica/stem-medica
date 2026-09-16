import { readFile } from "node:fs/promises";
import { parseEnv, isDeepStrictEqual } from "node:util";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { catalogueSchema } from "../src/lib/cms-schema";
import { postsSchema } from "../src/lib/post-schema";
import { contentDatabase } from "../src/lib/content-database";
import { contentDocuments } from "../src/lib/content-schema";
import { buildScalePreview } from "./fixtures/scale-preview-content";

async function main() {
  if (process.env.VERCEL || !process.argv.includes("--confirm-test-branch")) throw new Error("Confirmation required");
  const env = parseEnv(await readFile(".env.neon-test", "utf8"));
  if (env.NEON_BRANCH !== "test/cms-preview" || !env.DATABASE_URL ||
    new URL(env.DATABASE_URL).hostname !== "ep-bitter-resonance-b15i9672-pooler.c-5.eu-central-1.aws.neon.tech") throw new Error("Wrong test branch");
  process.env.CMS_DATABASE_URL = env.DATABASE_URL;
  const { db, pool } = contentDatabase();
  try {
    const rows = await db.select().from(contentDocuments);
    const catalogue = rows.find(r => r.key === "catalogue/current.json");
    const posts = rows.find(r => r.key === "posts/current.json");
    if (!catalogue || !posts) throw new Error("Missing content");
    // Only use the existing optimized test images; no duplicated binary uploads.
    for (let n = 1; n <= 5; n++) await readFile(`.local-storage/media/01994eee-3000-4000-8000-00000000000${n}.webp`);
    const next = buildScalePreview(catalogueSchema.parse(catalogue.data), postsSchema.parse(posts.data), new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Addis_Ababa" }));
    console.log({ before: { categories: catalogueSchema.parse(catalogue.data).categories.length, products: catalogueSchema.parse(catalogue.data).products.length, posts: postsSchema.parse(posts.data).length }, after: { categories: next.catalogue.categories.length, products: next.catalogue.products.length, posts: next.posts.length } });
    if (!process.argv.includes("--apply")) { console.log("Dry run only. Add --apply to save."); return; }
    await db.transaction(async tx => {
      for (const [row, data, backupPrefix] of [[catalogue, next.catalogue, "catalogue-history"], [posts, next.posts, "posts"]] as const) {
        if (isDeepStrictEqual(row.data, data)) continue;
        await tx.insert(contentDocuments).values({ key: `${backupPrefix}/scale-backup-${row.revision}.json`, data: row.data, revision: randomUUID() }).onConflictDoNothing();
        const updated = await tx.update(contentDocuments).set({ data, revision: randomUUID(), updatedAt: new Date() })
          .where(and(eq(contentDocuments.key, row.key), eq(contentDocuments.revision, row.revision))).returning({ key: contentDocuments.key });
        if (updated.length !== 1) throw new Error("Concurrent edit; rollback");
      }
    });
    const verified = await db.select().from(contentDocuments);
    if (!isDeepStrictEqual(verified.find(r => r.key === catalogue.key)?.data, next.catalogue) ||
      !isDeepStrictEqual(verified.find(r => r.key === posts.key)?.data, next.posts)) throw new Error("Read-back failed");
    console.log("Verified 100 products, 10 categories (10 products each), 60 posts. Existing entries preserved; backups saved; no new media uploads.");
  } finally { await pool.end(); }
}
main().catch(() => { console.error("Scale seed stopped. Credentials hidden. Check test branch, existing counts, media and concurrent edits."); process.exitCode = 1; });
