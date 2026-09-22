/**
 * List, and optionally delete, blobs under media/ that no published content
 * references.
 *
 * Referenced means: a category image, a product image, an achievement photo,
 * a post cover, or a post
 * gallery entry. Anything else is an upload that was replaced or abandoned.
 *
 *   npx tsx scripts/media-gc.ts            # list only
 *   MEDIA_GC_CONFIRM=delete npx tsx …      # delete the unreferenced ones
 */
import { list, del } from "@vercel/blob";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED, max: 1 });
  const doc = async (key: string) =>
    (await pool.query("SELECT data FROM content_document WHERE key=$1", [key])).rows[0]?.data;

  let catalogue: { categories?: { image?: string }[]; products?: { image?: string }[] } | undefined;
  let posts: { slug: string; image?: string; gallery?: { src: string }[] }[] = [];
  let stories: { image?: string }[] = [];
  try {
    catalogue = await doc("catalogue/current.json");
    posts = (await doc("posts/current.json")) ?? [];
    stories = (await doc("stories/current.json")) ?? [];
  } finally {
    await pool.end();
  }

  const referenced = new Set<string>();
  for (const item of [...(catalogue?.categories ?? []), ...(catalogue?.products ?? [])]) {
    if (item.image) referenced.add(item.image);
  }
  for (const post of posts) {
    if (post.image) referenced.add(post.image);
    for (const image of post.gallery ?? []) referenced.add(image.src);
  }
  // Achievements were missing here, so every achievement photo counted as an
  // orphan and would have been deleted on the next sweep.
  for (const story of stories) {
    if (story.image) referenced.add(story.image);
  }

  const blobs: { pathname: string; url: string; size: number }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: "media/", cursor, limit: 1000 });
    blobs.push(...page.blobs.map((b) => ({ pathname: b.pathname, url: b.url, size: b.size })));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const orphans = blobs.filter((b) => !referenced.has(`/${b.pathname}`));
  console.log(`referenced by content: ${referenced.size}`);
  console.log(`blobs under media/:    ${blobs.length}\n`);
  for (const b of blobs.sort((a, b) => b.size - a.size)) {
    const used = referenced.has(`/${b.pathname}`);
    console.log(`  ${used ? "KEEP  " : "ORPHAN"} ${String((b.size / 1024).toFixed(0) + " KB").padStart(9)}  ${b.pathname}`);
  }
  const total = orphans.reduce((sum, b) => sum + b.size, 0);
  console.log(`\nunreferenced: ${orphans.length} blob(s), ${(total / 1024).toFixed(0)} KB`);

  if (process.env.MEDIA_GC_CONFIRM !== "delete") {
    console.log("Set MEDIA_GC_CONFIRM=delete to remove them.");
    return;
  }
  for (const blob of orphans) await del(blob.url);
  console.log(`Deleted ${orphans.length} unreferenced blob(s).`);
}

main().catch((error: unknown) => {
  console.error("Media clean-up failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
