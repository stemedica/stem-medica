/**
 * Write sample blog posts so the Updates section has something to review.
 *
 * The guidance articles are genuinely useful and make no claim about STEM
 * MEDICA specifically, so they are safe to leave published. The two arrival
 * posts are illustrative and say so in the first line, because claiming a
 * shipment that did not happen would be a false statement on a public site.
 *
 *   POSTS_SEED_CONFIRM=replace npx tsx scripts/seed-posts.ts
 */
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { postsSchema } from "../src/lib/post-schema";

const KEY = "posts/current.json";
const day = (back: number) => new Date(Date.now() - back * 86_400_000).toISOString().slice(0, 10);

const posts = [
  {
    id: "b1000000-0000-4000-8000-000000000001",
    slug: "before-you-sign-for-a-mobile-x-ray",
    title: "What to check before your hospital signs for a mobile X-ray",
    date: day(4),
    kind: "Blog" as const,
    author: "STEM MEDICA",
    excerpt: "Eight questions worth asking any supplier before the acceptance form is signed, including us.",
    body: `Mobile digital radiography is one of the larger purchases a hospital makes, and the acceptance signature is the moment your leverage disappears. Here is what we would want a biomedical department to check first.

## Before the order

**Detector type, and whether it is shared.** The wireless flat panel is usually the most expensive single component. Confirm whether it is included in the quoted price, and whether it is tied to this unit alone.

**Generator output against your real case mix.** A 5 kW unit covers ward and ICU chest work comfortably. If abdominal imaging on larger patients is routine, say so before ordering rather than after.

**Battery life stated in exposures.** Hours is a marketing number. Exposures per charge is the operational one.

**Power quality at the installation point.** Mains conditions vary widely between facilities. A stabiliser specified up front costs far less than a replaced board later.

## At installation

**Radiation survey and safety sign-off**, documented and handed over as a physical record.

**Image quality acceptance on your own phantom**, not on a demonstration image supplied by the vendor.

**Radiographer training on every shift** that will use the unit, not only the staff present on delivery day.

## Before you sign

**Spare parts and turnaround, in writing.** Which parts are held in Addis Ababa, which are indent-only, and what the realistic response time is.

If a supplier cannot answer that last question clearly, that is itself the answer.`,
    image: "",
    published: true,
  },
  {
    id: "b1000000-0000-4000-8000-000000000002",
    slug: "preparing-your-site-before-equipment-arrives",
    title: "Preparing your site before equipment arrives",
    date: day(11),
    kind: "Blog" as const,
    author: "STEM MEDICA",
    excerpt: "Most delayed installations are decided weeks earlier, by something nobody checked. A short readiness list.",
    body: `An installation rarely fails on the day. It fails because something was not checked weeks earlier. This is the list we work through with a facility before equipment ships.

## The room

Confirm floor space with the doors open, not just the footprint of the device. Check the delivery route: lift dimensions, door widths, stair turns and thresholds. A machine that fits the room but not the corridor is a common and expensive surprise.

## Power and utilities

Record the available supply at the point of installation, not at the main board. Note whether the circuit is shared. Confirm any requirements for water, drainage, network points or medical gas, and whether a stabiliser or UPS is needed for the conditions at your site.

## Environment

Check ventilation and ambient temperature, particularly for laboratory analysers and imaging equipment. Manufacturers state operating ranges for a reason, and exceeding them shortens service life rather than stopping the machine outright.

## People

Identify who will receive operator training and make sure they are rostered to be present. Name the technical contact who will be responsible for the equipment afterwards. Equipment that nobody owns is equipment that stops being used.

## Consumables

Agree what the unit consumes and who orders it, before the device arrives. The most common reason equipment falls out of use is not a fault. It is a consumable that ran out and was never reordered.`,
    image: "",
    published: true,
  },
  {
    id: "b1000000-0000-4000-8000-000000000003",
    slug: "sample-upcoming-arrival-patient-monitors",
    title: "Upcoming arrival: patient monitors — sample post",
    date: day(2),
    kind: "Upcoming arrival" as const,
    author: "STEM MEDICA",
    excerpt: "Demonstration post showing how an upcoming shipment appears on the site.",
    body: `This is a sample post used to review how upcoming arrivals appear on the website. It does not describe a real shipment.

An upcoming arrival post would normally give the equipment type, the expected month, and who to contact to reserve a unit before it lands.

Replace this with approved content before launch.`,
    image: "",
    published: true,
    arrivalNoticeUntil: day(-60),
  },
  {
    id: "b1000000-0000-4000-8000-000000000004",
    slug: "sample-new-arrival-laboratory-analyser",
    title: "New arrival: laboratory analyser — sample post",
    date: day(6),
    kind: "New arrival" as const,
    author: "STEM MEDICA",
    excerpt: "Demonstration post showing how a new arrival appears on the site.",
    body: `This is a sample post used to review how new arrivals appear on the website. It does not describe real stock.

A new arrival post would normally cover what has landed, the configuration available, and what is included with supply such as installation, training and consumables.

Replace this with approved content before launch.`,
    image: "",
    published: true,
    arrivalNoticeUntil: day(-45),
  },
];

async function main() {
  if (process.env.POSTS_SEED_CONFIRM !== "replace") {
    throw new Error("Set POSTS_SEED_CONFIRM=replace to rewrite the posts document.");
  }
  const connectionString = process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString) throw new Error("DATABASE_URL_UNPOOLED is required.");

  const parsed = postsSchema.parse(posts);
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 15_000 });
  try {
    await pool.query(
      `INSERT INTO content_document (key, data, revision, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, revision = EXCLUDED.revision, updated_at = NOW()`,
      [KEY, JSON.stringify(parsed), randomUUID()],
    );
    console.log(`Posts replaced: ${parsed.length}`);
    for (const p of parsed) console.log(`  ${p.kind.padEnd(17)} ${p.date}  ${p.slug}`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("Posts seed failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
