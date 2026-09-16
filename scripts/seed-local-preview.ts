import path from "node:path";
import { randomUUID } from "node:crypto";
import { catalogueSchema } from "../src/lib/cms-schema";
import { postsSchema } from "../src/lib/post-schema";
import { previewCatalogue, previewPosts } from "./fixtures/local-preview-content";

async function main() {
  if (process.env.VERCEL || process.env.NODE_ENV === "production" || !process.argv.includes("--confirm-local")) throw new Error("Local preview only. Pass --confirm-local outside production.");
  process.env.STORAGE_DRIVER = "local";
  process.env.CONTENT_STORAGE_DRIVER = "";
  process.env.LOCAL_STORAGE_DIR = path.resolve(".local-storage");
  const { readJson, writeJson } = await import("../src/lib/storage");
  const catalogue = await readJson("catalogue/current.json");
  const posts = await readJson("posts/current.json");
  const current = catalogueSchema.parse(catalogue?.data ?? { categories: [], products: [] });
  const currentPosts = postsSchema.parse(posts?.data ?? []);
  const merged = catalogueSchema.parse({
    categories: [...current.categories, ...previewCatalogue.categories.filter((item) => !current.categories.some((existing) => existing.slug === item.slug))],
    products: [...current.products, ...previewCatalogue.products.filter((item) => !current.products.some((existing) => existing.slug === item.slug))],
  });
  const mergedPosts = postsSchema.parse([...currentPosts, ...previewPosts.filter((item) => !currentPosts.some((existing) => existing.slug === item.slug || existing.id === item.id))]);
  const backup = `local-preview-backups/${randomUUID()}`;
  if (catalogue) await writeJson(`${backup}-catalogue.json`, catalogue.data);
  if (posts) await writeJson(`${backup}-posts.json`, posts.data);
  await writeJson("catalogue/current.json", merged, catalogue?.etag ?? null);
  await writeJson("posts/current.json", mergedPosts, posts?.etag ?? null);
  console.log(`Local preview added: ${merged.categories.length - current.categories.length} categories, ${merged.products.length - current.products.length} products, ${mergedPosts.length - currentPosts.length} posts. Existing entries preserved. Backup prefix: ${backup}`);
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Local preview could not be saved"); process.exitCode = 1; });
