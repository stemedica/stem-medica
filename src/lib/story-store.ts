import { unstable_cache } from "next/cache";
import { storiesSchema, type CmsStory } from "./story-schema";
import { readJson, storageReady, contentStorageIdentity } from "./storage";

export const STORIES_KEY = "stories/current.json";

export async function readStories() {
  const saved = storageReady() ? await readJson<CmsStory[]>(STORIES_KEY) : null;
  return { stories: saved ? storiesSchema.parse(saved.data) : [], etag: saved?.etag ?? null };
}

export const getStoriesDocument = unstable_cache(async () => {
  const { stories } = await readStories();
  return stories;
}, ["stories-document", contentStorageIdentity(), process.env.LOCAL_STORAGE_DIR ?? ".local-storage", process.env.BLOB_STORE_ID ?? "default"], { tags: ["stories"], revalidate: 300 });

import { getAllPosts } from "./post-store";

export type FacilityStory = {
  title: string;
  place: string;
  summary: string;
  image?: string;
  postSlug?: string;
  linkedinUrl?: string;
};

/** Published achievements from unified posts, falling back to legacy stories if present. */
export async function getStories(): Promise<FacilityStory[]> {
  const posts = await getAllPosts();
  const achievements = posts.filter((p) => p.published && p.kind === "Achievement");
  if (achievements.length) {
    return achievements.map((p) => ({
      title: p.title,
      place: p.place || "Addis Ababa & Regional Facilities",
      summary: p.excerpt || p.body.slice(0, 300),
      image: p.image || undefined,
      postSlug: p.slug,
      linkedinUrl: p.linkedinUrl || undefined,
    }));
  }
  const { stories } = await readStories();
  return stories.filter((story) => story.published);
}
