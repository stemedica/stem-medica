import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import sharp from "sharp";
import { readJson, writeJson, readObject, writeObject } from "../src/lib/storage";
import { postsSchema } from "../src/lib/post-schema";
import { contentDatabase } from "../src/lib/content-database";

async function main() {
  if (process.env.VERCEL || !process.argv.includes("--confirm-test-branch")) throw new Error("Confirmation required");
  const env = parseEnv(await readFile(".env.neon-test", "utf8"));
  if (env.NEON_BRANCH !== "test/cms-preview" || !env.DATABASE_URL || new URL(env.DATABASE_URL).hostname !== "ep-bitter-resonance-b15i9672-pooler.c-5.eu-central-1.aws.neon.tech") throw new Error("Wrong branch");
  process.env.CMS_DATABASE_URL = env.DATABASE_URL;
  process.env.CONTENT_STORAGE_DRIVER = "postgres";
  process.env.STORAGE_DRIVER = "local";
  process.env.LOCAL_STORAGE_DIR = ".local-storage";
  try {
    const saved = await readJson("posts/current.json");
    if (!saved) throw new Error("Posts missing");
    const posts = postsSchema.parse(saved.data);
    const samples = [
      ["test-preparing-an-equipment-enquiry", "Equipment enquiries", "#173d8f"],
      ["test-monitoring-range-preview", "Upcoming equipment", "#245da8"],
      ["test-order-review-checklist", "Planning your proforma", "#243b70"],
    ];
    let changed = 0;
    for (const [index, [slug, title, color]] of samples.entries()) {
      const post = posts.find(p => p.slug === slug);
      if (!post || !post.title.includes("test")) throw new Error("Test identity missing");
      const key = `media/01994ddd-2000-4000-8000-00000000000${index + 1}.webp`;
      if (post.image && post.image !== `/${key}`) continue; // Preserve user-uploaded covers.
      if (!await readObject(key)) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
          <rect width="1200" height="675" fill="${color}"/>
          <path d="M800 0V675M1000 0V675M0 225H1200M0 450H1200" stroke="#ffffff" stroke-opacity=".12"/>
          <rect x="865" y="210" width="215" height="170" rx="14" fill="none" stroke="#b7d7ff" stroke-width="5"/>
          <path d="M885 350L950 285L990 320L1030 270L1060 305" fill="none" stroke="#b7d7ff" stroke-width="5"/>
          <text x="70" y="110" font-family="sans-serif" font-size="25" fill="#dbeafe" letter-spacing="4">STEM MEDICA / JOURNAL</text>
          <text x="70" y="330" font-family="sans-serif" font-size="48" font-weight="bold" fill="white">${title}</text>
          <text x="70" y="390" font-family="sans-serif" font-size="24" fill="#dbeafe">Cover image placeholder</text>
          <text x="70" y="595" font-family="sans-serif" font-size="21" fill="#dbeafe">TEST IMAGE 0${index + 1} / REPLACE IN CMS</text>
        </svg>`;
        const bytes = await sharp(Buffer.from(svg)).webp({ quality: 85 }).toBuffer();
        await writeObject(key, bytes, "image/webp");
      }
      if (!post.image) { post.image = `/${key}`; changed++; }
    }
    if (process.argv.includes("--gallery")) {
      const post = posts.find(p => p.slug === "test-preparing-an-equipment-enquiry")!;
      if (!post.gallery?.length) {
        post.gallery = [
          { src: "/media/01994ddd-2000-4000-8000-000000000002.webp", alt: "Blue placeholder showing an upcoming equipment illustration", caption: "Test gallery image — equipment requirements and supporting photographs." },
          { src: "/media/01994ddd-2000-4000-8000-000000000003.webp", alt: "Blue placeholder showing proforma planning artwork", caption: "Test gallery image — planning the equipment list before requesting a proforma." },
        ];
        changed++;
      }
    }
    if (changed) await writeJson("posts/current.json", postsSchema.parse(posts), saved.etag);
    const verified = postsSchema.parse((await readJson("posts/current.json"))?.data);
    for (const [slug] of samples) if (!verified.find(p => p.slug === slug)?.image) throw new Error("Image verification failed");
    if (process.argv.includes("--gallery") && !verified.find(p => p.slug === "test-preparing-an-equipment-enquiry")?.gallery?.length) throw new Error("Gallery verification failed");
    console.log(`Verified 3 CMS test post covers; ${changed} image links added. Existing uploads preserved. Images use local development media storage.`);
  } finally { await contentDatabase().pool.end(); }
}
main().catch(() => { console.error("Test image seed failed; credentials hidden. Check test branch and content identities."); process.exitCode = 1; });
