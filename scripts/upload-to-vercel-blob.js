const fs = require("fs");
const path = require("path");
const { put, head } = require("@vercel/blob");

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "";
const MEDIA_DIR = path.resolve("public/media");

async function uploadAll() {
  const files = fs.readdirSync(MEDIA_DIR).filter(f => f.endsWith(".webp"));
  console.log(`Found ${files.length} images to upload to Vercel Blob...`);

  let uploaded = 0;
  let skipped = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(MEDIA_DIR, file);
    const pathname = `media/${file}`;
    const buffer = fs.readFileSync(filePath);

    try {
      // Check if blob already exists to save time/bandwidth
      try {
        const existing = await head(pathname, { token: TOKEN });
        if (existing && existing.size === buffer.length) {
          console.log(`[${i + 1}/${files.length}] ⏭️  Already exists: ${pathname}`);
          skipped++;
          continue;
        }
      } catch {
        // Blob does not exist, proceed with upload
      }

      const blob = await put(pathname, buffer, {
        access: "private",
        addRandomSuffix: false,
        contentType: "image/webp",
        token: TOKEN
      });

      uploaded++;
      console.log(`[${i + 1}/${files.length}] ✅ Uploaded: ${pathname} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`[${i + 1}/${files.length}] ❌ Failed: ${pathname}`, err.message);
    }
  }

  console.log(`\nFinished Vercel Blob upload: ${uploaded} uploaded, ${skipped} skipped.`);
}

uploadAll().catch(console.error);
