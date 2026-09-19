import { z } from "zod";
export const postKinds = ["Blog", "Upcoming arrival", "New arrival"] as const;
export const postSchema = z.object({
  id: z.uuid(), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  title: z.string().trim().min(1).max(200), date: z.iso.date(), kind: z.preprocess((kind) => kind === "Order update" ? "Blog" : kind, z.enum(postKinds)),
  excerpt: z.string().trim().max(500).default(""), author: z.string().trim().max(100).default("STEM MEDICA").transform((author) => author || "STEM MEDICA"),
  arrivalNoticeUntil: z.union([z.literal(""), z.iso.date()]).optional(),
  arrivalNoticeEnabled: z.boolean().optional(),
  body: z.string().trim().max(8000), image: z.string().regex(/^$|^\/media\/[a-f0-9-]+\.(?:jpg|png|webp)$/), published: z.boolean(),
  gallery: z.array(z.object({
    src: z.string().regex(/^\/media\/[a-f0-9-]+\.(?:jpg|png|webp)$/),
    alt: z.string().trim().max(200).default(""),
    caption: z.string().trim().max(300).default(""),
  })).max(8).optional(),
}).superRefine((post, ctx) => {
  if (post.kind !== "Blog" && post.arrivalNoticeEnabled !== false && post.arrivalNoticeUntil && post.arrivalNoticeUntil < post.date) {
    ctx.addIssue({ code: "custom", path: ["arrivalNoticeUntil"], message: "Choose an expiry on or after the display date." });
  }
  if (post.published && !post.body) ctx.addIssue({ code: "custom", path: ["body"], message: "Published posts need article text" });
  const seen = new Set<string>();
  for (const [index, image] of (post.gallery ?? []).entries()) {
    if (seen.has(image.src)) ctx.addIssue({ code: "custom", path: ["gallery", index, "src"], message: "This image is already in the gallery" });
    seen.add(image.src);
  }
});
export const postsSchema = z.array(postSchema).max(60).superRefine((posts, ctx) => {
  for (const key of ["id", "slug"] as const) {
    const seen = new Set<string>();
    posts.forEach((post, index) => { if (seen.has(post[key])) ctx.addIssue({ code: "custom", path: [index, key], message: `Duplicate post ${key}` }); seen.add(post[key]); });
  }
});
export type CmsPost = z.infer<typeof postSchema>;
