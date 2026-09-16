import { readFile } from "node:fs/promises";
import { parseEnv, isDeepStrictEqual } from "node:util";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { contentDatabase } from "../src/lib/content-database";
import { contentDocuments } from "../src/lib/content-schema";
import { savedDraftSchema, DAYS_7 } from "../src/lib/cms-schema";

async function main() {
  if (process.env.VERCEL || !process.argv.includes("--confirm-test-branch")) throw new Error("Test confirmation required");
  const env = parseEnv(await readFile(".env.neon-test", "utf8"));
  if (env.NEON_BRANCH !== "test/cms-preview" || !env.DATABASE_URL ||
    new URL(env.DATABASE_URL).hostname !== "ep-bitter-resonance-b15i9672-pooler.c-5.eu-central-1.aws.neon.tech") throw new Error("Wrong test database");
  process.env.CMS_DATABASE_URL = env.DATABASE_URL;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DAYS_7).toISOString();
  const cases = [
    { id: "528047bb-d649-48ed-ae3e-74c49d9ef001", client: "TEST — Clinic equipment review", items: [
      { description: "Mindray BeneVision N1 patient monitor — TEST pricing", qty: 2, unit: "pcs", price: 125000 },
      { description: "GE MAC 5 ECG system — TEST pricing", qty: 1, unit: "pcs", price: 180000 },
    ] },
    { id: "528047bb-d649-48ed-ae3e-74c49d9ef002", client: "TEST — Laboratory equipment review", items: [
      { description: "Olympus CX23 biological microscope — TEST pricing", qty: 3, unit: "pcs", price: 85000 },
      { description: "Laboratory equipment installation and orientation — TEST", qty: 1, unit: "service", price: 5000 },
    ] },
    { id: "528047bb-d649-48ed-ae3e-74c49d9ef003", client: "TEST — Sterilization equipment review", items: [
      { description: "MELAG Vacuklav 31 B+ steam sterilizer — TEST pricing", qty: 1, unit: "pcs", price: 250000 },
      { description: "Sterilizer installation and operator orientation — TEST", qty: 1, unit: "service", price: 12000 },
    ] },
  ];
  try {
    const result = await contentDatabase().db.transaction(async tx => {
      let created = 0;
      for (const [index, entry] of cases.entries()) {
        const key = `drafts/${entry.id}.json`;
        const draft = savedDraftSchema.parse({
          id: entry.id, createdAt: now.toISOString(), expiresAt,
          issuer: { name: "STEM MEDICA — TEST ONLY", address: "Addis Ababa, Ethiopia", tin: "", vatReg: "", phone: "", email: "", bank: "", account: "" },
          doc: {
            number: `TEST/SM/PI/00${index + 1}`, date: now.toISOString().slice(0, 10), validity: expiresAt.slice(0, 10),
            currency: "ETB", vatRate: 15,
            client: { name: entry.client, attn: "Test procurement team (fictional)", address: "Addis Ababa, Ethiopia — fictional test client", tin: "" },
            items: entry.items.map((item, i) => ({ ...item, id: `${entry.id}-${i + 1}` })),
            notes: "TEST ONLY — Not a commercial offer. Fictional client and manually entered sample prices. The 15% VAT is a calculation test input, not tax advice. No stock, pricing or delivery commitment. Do not send to customers.",
            delivery: "Test only — delivery terms to be agreed before any real quotation.",
            payment: "Test only — no payment requested. Bank details intentionally omitted.",
          },
        });
        const inserted = await tx.insert(contentDocuments).values({ key, data: draft, revision: randomUUID() })
          .onConflictDoNothing().returning({ key: contentDocuments.key });
        const [saved] = await tx.select().from(contentDocuments).where(eq(contentDocuments.key, key));
        const verified = savedDraftSchema.parse(saved?.data);
        if (inserted.length && !isDeepStrictEqual(verified, draft)) throw new Error("Read-back failed");
        if (verified.doc.number !== draft.doc.number) throw new Error("Existing identity differs");
        created += inserted.length;
      }
      return created;
    });
    console.log(`Verified 3 test proforma drafts: ${result} created, ${3 - result} existing drafts preserved. No other documents changed.`);
    if (result) console.log(`New drafts expire at ${expiresAt}. Sample prices only; no emails sent.`);
  } finally { await contentDatabase().pool.end(); }
}
main().catch(() => { console.error("Test proforma seed failed; credentials hidden. Check test branch and draft identities."); process.exitCode = 1; });
