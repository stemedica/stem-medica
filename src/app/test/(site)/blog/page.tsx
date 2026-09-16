import { PostKindBadge } from "@/components/PostKindBadge";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getAllPosts, formatDate } from "@/lib/post-store";
import { postKinds } from "@/lib/post-schema";
import { readingMinutes } from "@/lib/post-slug";
import { site } from "@/lib/site";
import { Pagination } from "@/components/Pagination";
import { paginate } from "@/lib/pagination";
import { V2Photo } from "@/components/V2";
import { MobileCardRail } from "@/components/MobileCardRail";
import { hasArrivalNotice } from "@/lib/arrival-notice";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Updates & blog",
  description: "Equipment arrivals, company updates and insights from the STEM MEDICA team.",
  alternates: { canonical: `${site.url}/blog` },
};

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ kind?: string; q?: string | string[]; page?: string | string[] }> }) {
  const { kind: requestedKind, q, page } = await searchParams;
  const kind = postKinds.find((type) => type === (requestedKind === "Order update" ? "Blog" : requestedKind));
  const query = typeof q === "string" ? q.trim().slice(0, 200) : "";
  const all = await getAllPosts();
  const matching = all.filter((post) => `${post.title} ${post.excerpt} ${post.body}`.toLowerCase().includes(query.toLowerCase()));
  const filtered = matching.filter((post) => !kind || post.kind === kind);
  const result = paginate(filtered, page, 10);
  const posts = result.items;
  function filterHref(type: string) {
    const params = new URLSearchParams();
    if (type !== "All") params.set("kind", type);
    if (query) params.set("q", query);
    return `/test/blog${params.size ? `?${params}` : ""}`;
  }
  return <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-14">
    <header className="grid gap-6 border-b border-hair pb-10 md:grid-cols-[1.5fr_1fr] md:items-end">
      <div><p className="label text-navy">From the STEM MEDICA team</p><h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-navy sm:text-6xl">Updates &amp; insights.</h1></div>
      <p className="max-w-md text-lg leading-relaxed text-ink-soft">New arrivals, company news and ideas for better-equipped healthcare.</p>
    </header>
    <form action="/test/blog" role="search" className="mt-6 flex flex-wrap items-end gap-3">
      {kind ? <input type="hidden" name="kind" value={kind} /> : null}
      <label className="min-w-0 flex-1 basis-48 text-sm font-medium">Search updates<input type="search" name="q" key={query} defaultValue={query} maxLength={200} placeholder="Title or topic" className="mt-2 min-h-12 w-full rounded-xl border border-hair bg-white px-4 py-3" /></label>
      <button type="submit" className="min-h-12 rounded-xl bg-navy px-5 py-3 font-semibold text-white hover:bg-navy-deep">Search</button>
    </form>
    <nav aria-label="Post types" className="my-6 flex flex-wrap gap-2">
      {["All", ...postKinds].map((type) => <Link key={type} href={filterHref(type)} aria-current={(type === "All" ? !kind : kind === type) ? "page" : undefined} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hair px-4 py-2 text-sm text-navy transition-colors hover:bg-navy-tint aria-[current=page]:border-navy aria-[current=page]:bg-navy aria-[current=page]:text-white">{type}<span className="text-xs opacity-70">{type === "All" ? matching.length : matching.filter((post) => post.kind === type).length}</span></Link>)}
    </nav>
    {query ? <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm"><p>{filtered.length} results for “{query}”</p><Link href="/test/blog" className="inline-flex min-h-11 items-center text-navy underline">Clear filters</Link></div> : null}
    {!posts.length ? <div className="rounded-2xl border border-hair bg-white px-6 py-12 text-center"><p className="label text-steel">{kind ?? "Our journal"}</p><h2 className="font-display mt-3 text-2xl font-semibold text-navy">{query ? "No matching updates" : "More to share soon."}</h2><p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-soft">{query ? "Try another topic, or browse all published updates." : "No updates published here yet. Check back soon."}</p><Link href={kind || query ? "/test/blog" : "/test/products"} className="btn-outline mt-6 min-h-11">{kind || query ? "View all updates" : "Explore the catalogue"}</Link></div> : <MobileCardRail key={`${kind}-${query}-${result.page}`} label="Blog posts" columns={2}>
      {posts.map((post, index) => <article key={post.id}>
        <Link prefetch={false} href={`/test/blog/${post.slug}`} className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-hair bg-white transition-colors hover:border-navy/40 ${hasArrivalNotice(post) ? "arrival-card" : ""}`}>
          <V2Photo src={post.image || undefined} label={post.image ? post.title : `Cover image · ${post.title}`} rounded={false} className="aspect-video w-full self-center" />
          <div className="flex flex-1 flex-col items-start p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-steel"><PostKindBadge post={post} /><time dateTime={post.date}>{formatDate(post.date)}</time>{index === 0 && result.page === 1 && !query ? <span>Latest</span> : null}</div>
            <h2 className="font-display mt-4 break-words text-xl font-semibold leading-tight tracking-tight text-navy sm:text-2xl">{post.title}</h2>
            <p className="mb-6 mt-3 line-clamp-3 break-words text-sm leading-relaxed text-ink-soft sm:text-base">{post.excerpt}</p>
            <div className="mt-auto flex w-full flex-wrap items-center justify-between gap-4 border-t border-hair pt-5 text-sm"><span className="text-steel">{readingMinutes(post.body)} min read</span><span className="inline-flex items-center gap-2 font-medium text-navy">{post.kind !== "Blog" ? "View arrival details" : "Read story"} <ArrowRight size={16} aria-hidden="true" /></span></div>
          </div>
        </Link>
      </article>)}
    </MobileCardRail>}
    <Pagination page={result.page} pages={result.pages} pathname="/test/blog" filters={{ kind: kind ?? "", q: query }} />
  </div>;
}
