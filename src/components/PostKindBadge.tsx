import { Package } from "lucide-react";
import type { CmsPost } from "@/lib/post-schema";
import { arrivalLabel, hasArrivalNotice } from "@/lib/arrival-notice";

export function PostKindBadge({ post }: { post: Pick<CmsPost, "kind" | "date" | "arrivalNoticeUntil" | "arrivalNoticeEnabled"> }) {
  const label = arrivalLabel(post);
  return hasArrivalNotice(post)
    ? <span className="arrival-badge inline-flex items-center gap-2 rounded-full border border-blue-700/20 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900">
      <span className="arrival-mark relative inline-flex"><Package size={15} aria-hidden="true" /><span aria-hidden="true" className="arrival-pulse absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-blue-600" /></span>
      {label}
    </span>
    : <span className="inline-flex rounded-full bg-navy-tint px-3 py-1.5 text-xs font-medium text-navy">{label}</span>;
}
