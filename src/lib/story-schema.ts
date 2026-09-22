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
  published: z.boolean(),
});
export const storiesSchema = z.array(storySchema).max(60);
export type CmsStory = z.infer<typeof storySchema>;

export function blankStory(): CmsStory {
  return { id: crypto.randomUUID(), title: "", place: "", summary: "", image: "", published: false };
}
