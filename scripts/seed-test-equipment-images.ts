import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { catalogueSchema } from "../src/lib/cms-schema";
import { readJson, writeJson, readObject, writeObject } from "../src/lib/storage";
import { contentDatabase } from "../src/lib/content-database";

async function main() {
  if (process.env.VERCEL || !process.argv.includes("--confirm-test-branch")) throw new Error("Test confirmation required");
  const env = parseEnv(await readFile(".env.neon-test", "utf8"));
  if (env.NEON_BRANCH !== "test/cms-preview" || !env.DATABASE_URL ||
    new URL(env.DATABASE_URL).hostname !== "ep-bitter-resonance-b15i9672-pooler.c-5.eu-central-1.aws.neon.tech") throw new Error("Wrong branch");
  process.env.CMS_DATABASE_URL = env.DATABASE_URL;
  process.env.CONTENT_STORAGE_DRIVER = "postgres";
  process.env.STORAGE_DRIVER = "local";
  process.env.LOCAL_STORAGE_DIR = ".local-storage";
  try {
    const saved = await readJson("catalogue/current.json");
    if (!saved) throw new Error("Catalogue missing");
    const catalogue = catalogueSchema.parse(saved.data);
    const samples = [
      ["monitor", "test-mindray-benevision-n1", "test-patient-monitoring"],
      ["ecg", "test-ge-mac-5", "test-diagnostic-cardiology"],
      ["ventilator", "test-drager-savina-300", "test-critical-care"],
      ["sterilizer", "test-melag-vacuklav-31-b-plus", "test"],
      ["microscope", "test-olympus-cx23", "test2"],
    ];
    let changed = 0;
    for (const [index, [asset, slug, categorySlug]] of samples.entries()) {
      const product = catalogue.products.find(p => p.slug === slug);
      const category = catalogue.categories.find(c => c.slug === categorySlug);
      if (!product?.name.toLowerCase().includes("test") || !category?.name.toLowerCase().includes("test")) throw new Error("Test identity missing");
      const key = `media/01994eee-3000-4000-8000-00000000000${index + 1}.webp`;
      if (!product.image || !category.image) {
        if (!await readObject(key)) await writeObject(key, await readFile(`scripts/fixtures/equipment-images/${asset}.webp`), "image/webp");
        for (const entry of [product, category]) if (!entry.image) { entry.image = `/${key}`; changed++; }
      }
    }
    if (changed) {
      await writeJson("catalogue/current.json", catalogueSchema.parse(catalogue), saved.etag);
    }
    const verified = catalogueSchema.parse((await readJson("catalogue/current.json"))?.data);
    for (const [, slug, categorySlug] of samples) {
      if (!verified.products.find(p => p.slug === slug)?.image || !verified.categories.find(c => c.slug === categorySlug)?.image) throw new Error("Verification failed");
    }
    console.log(`Verified 5 test product and category images; ${changed} links added. Existing images preserved. Media stored locally; links in Neon test branch.`);
  } finally { await contentDatabase().pool.end(); }
}
main().catch(() => { console.error("Test image seed failed; credentials hidden. Check branch, test identities and concurrent edits."); process.exitCode = 1; });
