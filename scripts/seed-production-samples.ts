import { randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { inArray } from "drizzle-orm";
import { catalogueSchema, DAYS_7, savedDraftSchema } from "../src/lib/cms-schema";
import { postsSchema } from "../src/lib/post-schema";
import { contentDocuments } from "../src/lib/content-schema";

const catalogueKey = "catalogue/current.json";
const postsKey = "posts/current.json";
const vatDraftKey = "drafts/7b8787cc-1636-4aad-98f8-000000000001.json";
const noVatDraftKey = "drafts/7b8787cc-1636-4aad-98f8-000000000002.json";
const keys = [catalogueKey, postsKey, vatDraftKey, noVatDraftKey];

async function main() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString || !process.argv.includes("--confirm-production") || process.env.SAMPLE_SEED_CONFIRM !== "labelled-production-samples") {
    throw new Error("Explicit production sample confirmation is required.");
  }
  const host = new URL(connectionString).hostname;
  if (host !== "ep-quiet-truth-b1alj0ud.c-5.eu-central-1.aws.neon.tech") throw new Error("Refusing to seed an unexpected database host.");

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const expiresAt = new Date(now.getTime() + DAYS_7).toISOString();
  const catalogue = catalogueSchema.parse({
    categories: [
      { slug: "sample-patient-monitoring", name: "Patient monitoring — sample", short: "Monitoring", blurb: "Sample category for reviewing bedside and transport monitoring equipment. Demonstration content only." },
      { slug: "sample-laboratory", name: "Laboratory equipment — sample", short: "Laboratory", blurb: "Sample category for reviewing general laboratory equipment. Demonstration content only." },
    ],
    products: [
      { slug: "sample-bedside-patient-monitor", name: "Bedside patient monitor — sample", brand: "Sample brand", category: "sample-patient-monitoring", summary: "Demonstration product only, not confirmed inventory or pricing. Use this entry to review product details and quotation requests.", availability: "On request", leadTime: "Sample only — confirm before ordering", featured: true, published: true, specs: [{ label: "Equipment type", value: "Multiparameter patient monitor" }, { label: "Display", value: "Sample configuration — confirm requirements" }], services: ["Installation requirements confirmed before ordering", "Operator orientation quoted separately"] },
      { slug: "sample-transport-monitor", name: "Transport patient monitor — sample", brand: "Sample brand", category: "sample-patient-monitoring", summary: "Demonstration product only. The final model, accessories, price and availability must be confirmed by STEM MEDICA.", availability: "On request", leadTime: "Sample only — confirm before ordering", featured: false, published: true, specs: [{ label: "Equipment type", value: "Portable patient monitor" }], services: ["Configuration review before quotation"] },
      { slug: "sample-binocular-microscope", name: "Binocular laboratory microscope — sample", brand: "Sample brand", category: "sample-laboratory", summary: "Demonstration product only, provided to preview the catalogue and quotation workflow. This is not a stock claim.", availability: "On request", leadTime: "Sample only — confirm before ordering", featured: true, published: true, specs: [{ label: "Equipment type", value: "Binocular microscope" }, { label: "Application", value: "General laboratory review sample" }], services: ["Configuration and accessories confirmed before ordering"] },
      { slug: "sample-bench-centrifuge", name: "Bench-top centrifuge — sample", brand: "Sample brand", category: "sample-laboratory", summary: "Demonstration product only. Confirm capacity, rotor, electrical requirements and availability before requesting a real quotation.", availability: "On request", leadTime: "Sample only — confirm before ordering", featured: false, published: true, specs: [{ label: "Equipment type", value: "Bench-top centrifuge" }], services: ["Site requirements reviewed before quotation"] },
    ],
  });
  const posts = postsSchema.parse([
    { id: "7b8787cc-1636-4aad-98f8-100000000001", slug: "sample-preparing-equipment-request", title: "How to prepare an equipment request — sample post", date, kind: "Blog", author: "STEM MEDICA", image: "", published: true, excerpt: "Sample guidance showing the details that help our team prepare a clear equipment quotation.", body: "This is demonstration content for reviewing the website. Replace it with approved company guidance before launch.\n\n## List the equipment\n\nInclude the equipment name, quantity and preferred model when one has already been approved.\n\n## Add site details\n\nShare the facility, delivery city and any installation requirements that may affect the quotation.\n\n## Confirm the final offer\n\nReview the model, accessories, currency, validity, delivery, training and warranty terms before approving a purchase." },
    { id: "7b8787cc-1636-4aad-98f8-100000000002", slug: "sample-installation-readiness-checklist", title: "Installation readiness checklist — sample post", date, kind: "Blog", author: "STEM MEDICA", image: "", published: true, excerpt: "A sample checklist for discussing space, power, delivery access and staff orientation before equipment arrives.", body: "This sample post demonstrates the article layout; it is not technical or clinical advice. Replace it with an approved checklist before public launch.\n\n## Review the room\n\nConfirm space, access, ventilation and any environmental requirements specified by the manufacturer.\n\n## Confirm utilities\n\nRecord the available electrical supply and any water, drainage, network or medical-gas requirements.\n\n## Plan handover\n\nIdentify the staff who will receive operator orientation and the technical contact responsible for ongoing support." },
  ]);

  const issuer = { name: "STEM MEDICA — SAMPLE ONLY", address: "Addis Ababa, Ethiopia", tin: "", vatReg: "", phone: "+251 921 136 180", email: "", bank: "", account: "" };
  const makeDraft = (id: string, includeVat: boolean) => savedDraftSchema.parse({
    id,
    createdAt: now.toISOString(),
    expiresAt,
    issuer,
    doc: {
      number: includeVat ? "SAMPLE/PI/VAT" : "SAMPLE/PI/NO-VAT",
      date,
      validity: expiresAt.slice(0, 10),
      currency: "ETB",
      includeVat,
      vatRate: 15,
      client: { name: includeVat ? "Sample General Hospital — fictional" : "Sample Diagnostic Centre — fictional", attn: "Sample procurement contact", address: "Addis Ababa, Ethiopia", tin: "" },
      items: [{ id: `${id}-item-1`, catalogueSlug: includeVat ? "sample-bedside-patient-monitor" : "sample-binocular-microscope", description: includeVat ? "Bedside patient monitor — sample item" : "Binocular laboratory microscope — sample item", qty: includeVat ? 2 : 1, unit: "pcs", price: includeVat ? 100_000 : 75_000 }],
      notes: includeVat ? "SAMPLE ONLY — Illustrative pricing with 15% VAT enabled. Not a commercial offer or tax advice." : "SAMPLE ONLY — Illustrative pricing with VAT excluded. Not a commercial offer or tax advice.",
      delivery: "Sample only — delivery terms must be confirmed for a real quotation.",
      payment: "Sample only — no payment is requested. Bank details are intentionally omitted.",
    },
  });
  const vatDraft = makeDraft("7b8787cc-1636-4aad-98f8-000000000001", true);
  const noVatDraft = makeDraft("7b8787cc-1636-4aad-98f8-000000000002", false);
  const expected = new Map<string, unknown>([[catalogueKey, catalogue], [postsKey, posts], [vatDraftKey, vatDraft], [noVatDraftKey, noVatDraft]]);

  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10_000, query_timeout: 15_000 });
  try {
    const db = drizzle(pool);
    await db.transaction(async (tx) => {
      const existing = await tx.select().from(contentDocuments).where(inArray(contentDocuments.key, keys));
      if (existing.length) throw new Error("Production content already exists; refusing to overwrite it.");
      for (const [key, data] of expected) await tx.insert(contentDocuments).values({ key, data, revision: randomUUID() });
    });
    const saved = await db.select().from(contentDocuments).where(inArray(contentDocuments.key, keys));
    if (saved.length !== expected.size || saved.some((row) => !isDeepStrictEqual(row.data, expected.get(row.key)))) throw new Error("Production sample read-back verification failed.");
    console.log(`Verified production samples: ${catalogue.categories.length} categories, ${catalogue.products.length} products, ${posts.length} posts and 2 proforma drafts.`);
    console.log(`Proforma drafts expire at ${expiresAt}; one includes 15% VAT and one excludes VAT.`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  const failure = error as { name?: string; code?: string; cause?: { code?: string } };
  console.error("Production sample seed failed without exposing credentials.", { type: failure.name, code: failure.code, causeCode: failure.cause?.code, message: failure instanceof Error ? failure.message : "Unknown error" });
  process.exitCode = 1;
});
