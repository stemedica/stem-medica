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

/** Published entries only, in the order the admin arranged them. */
export async function getStories() {
  return (await getStoriesDocument()).filter((story) => story.published);
}
