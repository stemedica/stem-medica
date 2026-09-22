import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts, formatDate } from "@/lib/post-store";
import { postKinds } from "@/lib/post-schema";
import { readingMinutes } from "@/lib/post-slug";
import { site } from "@/lib/site";
import { BlogBrowser, type PostPreview } from "@/components/BlogBrowser";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Updates & blog",
  description: "Equipment arrivals, company updates and insights from the STEM MEDICA team.",
  alternates: { canonical: `${site.url}/blog` },
};

export default async function BlogIndex({ searchParams }: {
  searchParams: Promise<{ kind?: string; q?: string | string[] }>;
}) {
  const { kind: requestedKind, q } = await searchParams;
  const kind = postKinds.find((type) => type === (requestedKind === "Order update" ? "Blog" : requestedKind));
  const query = typeof q === "string" ? q.trim().slice(0, 200) : "";
  const all = await getAllPosts();

  // Reading time is computed here so article bodies never reach the client.
  const previews: PostPreview[] = all.map((post) => ({
    id: post.id, slug: post.slug, title: post.title, excerpt: post.excerpt,
    date: post.date, dateLabel: formatDate(post.date), kind: post.kind,
    image: post.image, minutes: readingMinutes(post.body),
    arrivalNoticeUntil: post.arrivalNoticeUntil, arrivalNoticeEnabled: post.arrivalNoticeEnabled,
  }));

  return <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-14">
    <header className="reveal grid gap-6 border-b border-hair pb-10 md:grid-cols-[1.4fr_1fr] md:items-end">
      <h1 className="font-display wdth-w max-w-[16ch] text-[clamp(2.2rem,4.6vw,3.9rem)] font-semibold leading-[1.04] tracking-[-.035em] text-navy text-balance">
        Updates from STEM MEDICA<span className="text-scarlet">.</span>
      </h1>
      <p className="max-w-[46ch] text-lg leading-relaxed text-ink-soft">
        New equipment, company news and practical guidance for your facility.
      </p>
    </header>

    <BlogBrowser posts={previews} kinds={[...postKinds]} initialQuery={query} initialKind={kind ?? ""} />

    {/* The blog had no conversion path at all: a reader who had just seen an
        arrival announced could not act on it from here. */}
    <aside className="reveal mt-16 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-hair bg-paper p-6 sm:p-8">
      <div>
        <h2 className="font-display text-xl font-semibold text-navy">Seen something you need?</h2>
        <p className="mt-2 max-w-[56ch] text-base leading-relaxed text-ink-soft">
          Tell us the equipment and quantities and we will come back with pricing and delivery time.
        </p>
      </div>
      <Link href="/quote" className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-scarlet px-6 text-sm font-semibold text-white transition-colors hover:bg-vital">
        Request a quote <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </aside>
  </div>;
}
