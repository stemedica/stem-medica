import type { CmsPost } from "./post-schema";

type ArrivalPost = Pick<CmsPost, "kind" | "date" | "arrivalNoticeUntil" | "arrivalNoticeEnabled">;
export const DEFAULT_ARRIVAL_DAYS = 90;
const DAY = 86_400_000;
/** Includes the display date as day one. All notice cutoffs use Addis Ababa time. */
export function arrivalNoticeEnd(post: Pick<ArrivalPost, "date" | "arrivalNoticeUntil">) {
  if (post.arrivalNoticeUntil) return post.arrivalNoticeUntil;
  const start = Date.parse(`${post.date}T00:00:00Z`);
  return Number.isFinite(start) ? new Date(start + (DEFAULT_ARRIVAL_DAYS - 1) * DAY).toISOString().slice(0, 10) : "";
}
export function hasArrivalNotice(post: ArrivalPost, now = Date.now()) {
  if (post.kind === "Blog" || post.kind === "Achievement" || post.arrivalNoticeEnabled === false) return false;
  const end = arrivalNoticeEnd(post);
  return !!end && now >= Date.parse(`${post.date}T00:00:00+03:00`) &&
    now < Date.parse(`${end}T00:00:00+03:00`) + DAY;
}
export function arrivalLabel(post: ArrivalPost, now = Date.now()) {
  if (post.kind === "Blog" || post.kind === "Achievement") return post.kind;
  return hasArrivalNotice(post, now) ? post.kind : "Arrival update";
}
