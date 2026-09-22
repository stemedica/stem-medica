/* Arrival notices previously used raw Tailwind blues, the only component on
   the site not speaking its own palette. */
import { Package } from "lucide-react";
import type { CmsPost } from "@/lib/post-schema";
import { arrivalLabel, hasArrivalNotice } from "@/lib/arrival-notice";

export function PostKindBadge({ post }: { post: Pick<CmsPost, "kind" | "date" | "arrivalNoticeUntil" | "arrivalNoticeEnabled"> }) {
  const label = arrivalLabel(post);
  return hasArrivalNotice(post)
    ? <span className="arrival-badge inline-flex items-center gap-2 rounded-full border border-navy/20 bg-navy-tint px-3 py-1.5 text-xs font-semibold text-navy-deep">
      <span className="arrival-mark relative inline-flex"><Package size={15} aria-hidden="true" /><span aria-hidden="true" className="arrival-pulse absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-scarlet" /></span>
      {label}
    </span>
    : <span className="inline-flex rounded-full bg-navy-tint px-3 py-1.5 text-xs font-medium text-navy">{label}</span>;
}
