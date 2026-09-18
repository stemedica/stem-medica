import { del, list } from "@vercel/blob";

async function main() {
  const blobs = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: "media/", cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  const totalBytes = blobs.reduce((total, blob) => total + blob.size, 0);
  console.log(`Private media inventory: ${blobs.length} object(s), ${totalBytes} byte(s).`);
  if (!process.argv.includes("--apply")) {
    console.log("Dry run only. Add --apply to remove all orphaned media objects.");
    return;
  }
  if (process.env.BLOB_CLEAN_CONFIRM !== "empty-production-content") throw new Error("Explicit production-content confirmation required.");
  for (let index = 0; index < blobs.length; index += 100) await del(blobs.slice(index, index + 100).map((blob) => blob.url));
  const remaining = await list({ prefix: "media/", limit: 1 });
  if (remaining.blobs.length) throw new Error("Media cleanup verification failed.");
  console.log(`Removed ${blobs.length} orphaned media object(s); none remain.`);
}

main().catch((error: unknown) => {
  const failure = error as { name?: string; code?: string };
  console.error("Blob media cleanup failed without exposing credentials.", { type: failure.name, code: failure.code });
  process.exitCode = 1;
});
