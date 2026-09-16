import type { CmsPost } from "./post-schema";
import { postSummary } from "./post-slug";
import { site } from "./site";

export function linkedInShare(post: Pick<CmsPost, "slug" | "title" | "excerpt" | "body">) {
  const url = new URL(`/blog/${encodeURIComponent(post.slug)}`, site.url).href;
  return { url, text: `${post.title}\n\n${postSummary(post)}\n\nRead the full article: ${url}` };
}
