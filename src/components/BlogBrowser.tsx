"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { PostKindBadge } from "./PostKindBadge";
import { V2Photo } from "./V2";
import { hasArrivalNotice } from "@/lib/arrival-notice";
import type { CmsPost } from "@/lib/post-schema";

const PAGE = 9;

/** Only what a card reads. Article bodies stay on the server. */
export type PostPreview = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateLabel: string;
  kind: CmsPost["kind"];
  image: string;
  minutes: number;
  arrivalNoticeUntil: CmsPost["arrivalNoticeUntil"];
  arrivalNoticeEnabled: CmsPost["arrivalNoticeEnabled"];
};

export function BlogBrowser({ posts, kinds, initialQuery, initialKind }: {
  posts: PostPreview[];
  kinds: CmsPost["kind"][];
  initialQuery: string;
  initialKind: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [kind, setKind] = useState(initialKind);
  const [page, setPage] = useState({ signature: `${initialQuery}|${initialKind}`, count: PAGE });
  const deferred = useDeferredValue(query);
  const first = useRef(true);

  // Titles and summaries only. Searching bodies would mean shipping every
  // article to every visitor for the sake of a filter.
  const haystacks = useMemo(
    () => posts.map((post) => `${post.title} ${post.excerpt} ${post.kind}`.toLowerCase()),
    [posts],
  );

  const matchingQuery = useMemo(() => {
    const needle = deferred.trim().toLowerCase();
    return posts.filter((_, index) => !needle || haystacks[index].includes(needle));
  }, [posts, haystacks, deferred]);

  const matches = useMemo(
    () => matchingQuery.filter((post) => !kind || post.kind === kind),
    [matchingQuery, kind],
  );

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (kind) params.set("kind", kind);
    const search = params.toString();
    window.history.replaceState(null, "", search ? `/blog?${search}` : "/blog");
  }, [query, kind]);

  const signature = `${deferred}|${kind}`;
  const shown = page.signature === signature ? page.count : PAGE;
  const visible = matches.slice(0, shown);

  return (
    <>
      <div className="reveal mt-8">
        <label className="relative block max-w-xl">
          <span className="sr-only">Search updates</span>
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-steel" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value.slice(0, 200))}
            placeholder="Search updates by title or topic"
            className="h-12 w-full rounded-xl border border-hair bg-white pl-11 pr-11 text-base outline-none transition-colors focus:border-navy"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search"
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-steel transition-colors hover:bg-paper hover:text-navy">
              <X size={17} aria-hidden="true" />
            </button>
          ) : null}
        </label>

        <nav aria-label="Post types" className="mt-4 flex flex-wrap gap-2">
          {["All", ...kinds].map((type) => {
            const value = type === "All" ? "" : type;
            const active = kind === value;
            const count = type === "All" ? matchingQuery.length : matchingQuery.filter((post) => post.kind === type).length;
            return (
              <button key={type} type="button" onClick={() => setKind(value)} aria-pressed={active}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${active ? "border-navy bg-navy text-white" : "border-hair text-navy hover:bg-navy-tint"}`}>
                {type}<span className="text-xs tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </nav>

        <p role="status" aria-live="polite" aria-atomic="true" className="mt-4 text-sm text-ink-soft">
          {matches.length} {matches.length === 1 ? "update" : "updates"}{query.trim() ? ` matching “${query.trim()}”` : ""}
        </p>
      </div>

      {matches.length ? (
        <>
          <section aria-label="Updates" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((post) => (
              <article key={post.id} className="reveal">
                <Link prefetch={false} href={`/blog/${post.slug}`}
                  className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-hair bg-white transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-navy/40 hover:shadow-[0_18px_44px_rgba(15,37,85,.12)] ${hasArrivalNotice(post) ? "arrival-card" : ""}`}>
                  {post.image ? (
                    <div className="overflow-hidden border-b border-hair">
                      <V2Photo src={post.image} label={post.title} rounded={false} className="aspect-video w-full transition-transform duration-500 group-hover:scale-[1.04]" />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col items-start p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-steel">
                      <PostKindBadge post={post} />
                      <time dateTime={post.date}>{post.dateLabel}</time>
                    </div>
                    <h2 className="font-display mt-4 break-words text-xl font-semibold leading-snug text-navy text-balance">{post.title}</h2>
                    <p className="mt-3 line-clamp-3 break-words text-[15px] leading-relaxed text-ink-soft">{post.excerpt}</p>
                    <div className="mt-auto flex w-full flex-wrap items-center justify-between gap-4 border-t border-hair pt-5 text-sm">
                      <span className="text-steel">{post.minutes} min read</span>
                      <span className="inline-flex items-center gap-2 font-semibold text-navy">
                        {post.kind !== "Blog" ? "View arrival" : "Read story"}
                        <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </section>
          {shown < matches.length ? (
            <div className="mt-8 flex justify-center">
              <button type="button" onClick={() => setPage({ signature, count: shown + PAGE })} className="btn-outline min-h-12 px-7">
                Show more ({matches.length - shown} left)
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-hair bg-white px-6 py-12 text-center">
          <h2 className="font-display text-2xl font-semibold text-navy">No matching updates</h2>
          <p className="mx-auto mt-3 max-w-[46ch] text-base leading-relaxed text-ink-soft">
            Try another topic, or clear the filters to see everything we have published.
          </p>
          <button type="button" onClick={() => { setQuery(""); setKind(""); }} className="btn-outline mt-6 min-h-11">Clear filters</button>
        </div>
      )}
    </>
  );
}
