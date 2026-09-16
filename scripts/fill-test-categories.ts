import { readFile } from "node:fs/promises";
import { parseEnv, isDeepStrictEqual } from "node:util";
import { createHash } from "node:crypto";
import { catalogueSchema, type CmsProduct } from "../src/lib/cms-schema";
import { readJson, writeJson, ConflictError } from "../src/lib/storage";
import { contentDatabase } from "../src/lib/content-database";

// Manufacturer references and deliberately limited claims:
// https://configurator.melag.com/sites/default/files/import/Pro-Class.pdf
// https://www.olympus-global.com/technology/design/product/cx23.html
const products: CmsProduct[] = [
  {
    slug: "test-melag-vacuklav-31-b-plus", name: "Vacuklav 31 B+ steam sterilizer — test",
    brand: "MELAG", category: "test", origin: "", image: "",
    summary: "Test catalogue entry, not confirmed stock. The Vacuklav 31 B+ is a stand-alone steam sterilizer. This example supports testing catalogue browsing and manual quotations. Confirm the exact model, installation requirements and accessories before ordering.",
    availability: "On request", leadTime: "Test content — no delivery commitment",
    featured: false, published: true, services: [],
    specs: [{ label: "Equipment type", value: "Steam sterilizer" }, { label: "Model", value: "Vacuklav 31 B+" }],
  },
  {
    slug: "test-olympus-cx23", name: "CX23 biological microscope — test",
    brand: "Olympus", category: "test2", origin: "", image: "",
    summary: "Test catalogue entry, not confirmed stock. The CX23 is a biological microscope. Use this example to review laboratory equipment details and manual quotations. Confirm the optical configuration, accessories and local availability before ordering.",
    availability: "On request", leadTime: "Test content — confirm availability",
    featured: false, published: true, services: [],
    specs: [{ label: "Equipment type", value: "Biological microscope" }, { label: "Model", value: "CX23" }],
  },
];
async function main() {
  if (process.env.VERCEL || !process.argv.includes("--confirm-test-branch")) throw new Error("Test confirmation required");
  const env = parseEnv(await readFile(".env.neon-test", "utf8"));
  if (env.NEON_BRANCH !== "test/cms-preview" || !env.DATABASE_URL ||
    new URL(env.DATABASE_URL).hostname !== "ep-bitter-resonance-b15i9672-pooler.c-5.eu-central-1.aws.neon.tech") throw new Error("Wrong test database");
  process.env.CMS_DATABASE_URL = env.DATABASE_URL;
  process.env.CONTENT_STORAGE_DRIVER = "postgres";
  try {
    const saved = await readJson("catalogue/current.json");
    if (!saved) throw new Error("Catalogue missing");
    const current = catalogueSchema.parse(saved.data);
    for (const [slug, name] of [["test", "Sterilization & infection control — test"], ["test2", "Laboratory equipment — test"]]) {
      if (!current.categories.some(c => c.slug === slug && c.name === name)) throw new Error("Category identity changed");
    }
    const additions = products.filter(product => {
      const existing = current.products.find(p => p.slug === product.slug || (p.name === product.name && p.brand === product.brand));
      if (existing && !isDeepStrictEqual(existing, product)) throw new Error("Existing product differs; refusing to overwrite");
      return !existing;
    });
    console.log("Current published product counts:", current.categories.filter(c => ["test", "test2"].includes(c.slug)).map(c => ({ category: c.name, count: current.products.filter(p => p.category === c.slug && p.published).length })));
    if (!additions.length) { console.log("Both test products already exist; no duplicates added."); return; }
    const next = catalogueSchema.parse({ ...current, products: [...current.products, ...additions] });
    const historyKey = `catalogue-history/0-${createHash("sha256").update(saved.etag).digest("hex")}.json`;
    try { await writeJson(historyKey, current); } catch (error) { if (!(error instanceof ConflictError)) throw error; }
    await writeJson("catalogue/current.json", next, saved.etag);
    if (!isDeepStrictEqual((await readJson("catalogue/current.json"))?.data, next)) throw new Error("Read-back verification failed");
    console.log(`Added and verified ${additions.length} labelled test products. Other entries preserved; previous revision archived in Neon.`);
  } finally { await contentDatabase().pool.end(); }
}
main().catch(() => { console.error("Test update failed; credentials hidden. Check branch, category identities and concurrent edits."); process.exitCode = 1; });
