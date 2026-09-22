import { z } from "zod";

const image = z.string().regex(/^$|^\/media\/[a-f0-9-]+\.(?:jpg|png|webp)$/);

/**
 * An achievement: work STEM MEDICA has carried out for a facility.
 *
 * `place` is where it happened and `title` is what was done. Both are plain
 * text because a real entry names a hospital or a town, which no slug rule
 * should have to encode.
 */
export const storySchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(160),
  place: z.string().trim().min(1).max(120),
  summary: z.string().trim().max(600).default(""),
  image: image.default(""),
  /**
   * Optional blog post telling this story in full. When set the card carries a
   * button through to it; when empty the card shows none, because a button
   * that goes nowhere is worse than no button at all.
   */
  postSlug: z.union([z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120), z.literal("")]).default(""),
  published: z.boolean(),
});
export const storiesSchema = z.array(storySchema).max(60);
export type CmsStory = z.infer<typeof storySchema>;

function generateUUID(): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function blankStory(): CmsStory {
  return { id: generateUUID(), title: "", place: "", summary: "", image: "", postSlug: "", published: false };
}
