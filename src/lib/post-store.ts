import { unstable_cache } from "next/cache";
import { postsSchema, type CmsPost } from "./post-schema";
import { readJson, storageReady, contentStorageIdentity } from "./storage";
import { postSummary } from "./post-slug";
export const POSTS_KEY = "posts/current.json";
export async function readPosts() {
  const saved = storageReady() ? await readJson<CmsPost[]>(POSTS_KEY) : null;
  return { posts: saved ? postsSchema.parse(saved.data) : [], etag: saved?.etag ?? null };
}
export const getPostsDocument = unstable_cache(async () => {
  const { posts } = await readPosts();
  return posts;
}, ["posts-document", contentStorageIdentity(), process.env.LOCAL_STORAGE_DIR ?? ".local-storage", process.env.BLOB_STORE_ID ?? "default"], { tags: ["posts"], revalidate: 300 });
export async function getAllPosts() {
  const posts = await getPostsDocument();
  return posts.filter((post) => post.published).map((post) => ({ ...post, excerpt: postSummary(post) })).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}
export async function getPost(slug: string) { return (await getAllPosts()).find((post) => post.slug === slug) ?? null; }
export const formatDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
