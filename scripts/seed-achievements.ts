/**
 * Replace the achievements collection with sample entries, against PRODUCTION.
 *
 * Written to exercise the homepage card with awkward artwork: the five images
 * span a 2.34 panorama to a 0.56 portrait, so a card that only looks right
 * with tidy landscape photographs will show it.
 *
 * These are samples. Delete them in the admin under Achievements once real
 * work is written up.
 *
 *   IMAGE_DIR=/path/to/crops npx tsx scripts/seed-achievements.ts
 */
import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { randomUUID } from "node:crypto";
import path from "node:path";

const ENV_FILE = ".env.production.local";
const PRODUCTION_HOST = "ep-quiet-truth-b1alj0ud.c-5.eu-central-1.aws.neon.tech";

const ENTRIES: { file: string; title: string; place: string; summary: string }[] = [
  { file: "panorama", title: "Sample — theatre and recovery fit-out", place: "Sample entry · Addis Ababa",
    summary: "A panorama crop, to check a very wide photograph still fills the card without the subject drifting out of frame." },
  { file: "portrait", title: "Sample — intensive care unit", place: "Sample entry · Adama",
    summary: "A portrait crop. Most phone photographs arrive this way, so it is the shape the card has to survive." },
  { file: "square", title: "Sample — laboratory commissioning", place: "Sample entry · Hawassa",
    summary: "A square crop, the shape a social upload tends to be." },
  { file: "tall", title: "Sample — emergency department", place: "Sample entry · Bahir Dar",
    summary: "A tall 9:16 crop, the most extreme case: almost all of it is cropped away at desktop width." },
  { file: "landscape", title: "Sample — imaging room handover", place: "Sample entry · Mekelle",
    summary: "A conventional 3:2 landscape, the easy case, for comparison against the four above." },
];

async function main() {
  const env = parseEnv(await readFile(ENV_FILE, "utf8"));
  const url = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
  if (!url) throw new Error(`${ENV_FILE} has no database connection.`);
  const host = new URL(url).hostname.replace("-pooler", "");
  if (host !== PRODUCTION_HOST) throw new Error(`Refusing: ${ENV_FILE} points at ${host}.`);

  // Media must reach the same Blob store the deployed site reads, so the
  // local-disk driver from .env.local is overridden here.
  // Assigning undefined to process.env stores the STRING "undefined", which the
  // Blob SDK then reads as a store id and rejects with "store does not exist".
  // Only defined values are copied.
  const overrides: Record<string, string | undefined> = {
    DATABASE_URL: env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: env.DATABASE_URL_UNPOOLED,
    CONTENT_STORAGE_DRIVER: "postgres",
    STORAGE_DRIVER: "blob",
    BLOB_READ_WRITE_TOKEN: env.BLOB_READ_WRITE_TOKEN,
    BLOB_STORE_ID: env.BLOB_STORE_ID,
  };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  const { writeObject, writeJson } = await import("../src/lib/storage");
  const { readStories, STORIES_KEY } = await import("../src/lib/story-store");
  const { storiesSchema } = await import("../src/lib/story-schema");

  const dir = process.env.IMAGE_DIR;
  if (!dir) throw new Error("Set IMAGE_DIR to the folder holding the crops.");

  const stories = [];
  for (const entry of ENTRIES) {
    const bytes = await readFile(path.join(dir, `${entry.file}.jpg`));
    const id = `${randomUUID()}.jpg`;
    await writeObject(`media/${id}`, bytes, "image/jpeg");
    stories.push({
      id: randomUUID(), title: entry.title, place: entry.place, summary: entry.summary,
      image: `/media/${id}`, postSlug: "", published: true,
    });
    console.log(`uploaded ${entry.file.padEnd(10)} ${String(Math.round(bytes.byteLength / 1024)).padStart(4)} KB -> /media/${id}`);
  }

  const parsed = storiesSchema.parse(stories);
  const { etag } = await readStories();
  await writeJson(STORIES_KEY, parsed, etag);
  console.log(`\nWrote ${parsed.length} achievements, replacing whatever was there.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Seed failed.");
  process.exitCode = 1;
});
