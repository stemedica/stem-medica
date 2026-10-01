import { PostKindBadge } from "@/components/PostKindBadge";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPost, getAllPosts, formatDate } from "@/lib/post-store";
import { PostBody } from "@/components/PostBody";
import { PostGallery } from "@/components/PostGallery";
import { readingMinutes, postSections } from "@/lib/post-slug";
import { site } from "@/lib/site";
import { MobileCardRail } from "@/components/MobileCardRail";
import { V2Photo } from "@/components/V2";
import { hasArrivalNotice } from "@/lib/arrival-notice";
import { publicMediaUrl } from "@/lib/preview-paths";
import { ArticleSchema, BreadcrumbSchema } from "@/components/StructuredData";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  const url = `${site.url}/blog/${post.slug}`;
  return {
    title: post.title, description: post.excerpt, alternates: { canonical: url },
    openGraph: { type: "article", title: post.title, description: post.excerpt, url, siteName: "STEM MEDICA", authors: [post.author], publishedTime: `${post.date}T12:00:00.000Z`, images: post.image ? [{ url: `${site.url}${post.image}`, alt: post.title }] : [] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const more = (await getAllPosts()).filter((item) => item.id !== post.id).slice(0, 2);
  const sections = postSections(post.body);
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      <ArticleSchema
        title={post.title}
        description={post.excerpt}
        date={post.date}
        author={post.author}
        image={post.image}
        slug={post.slug}
      />
      <BreadcrumbSchema
        trail={[
          { name: "Home", path: "/" },
          { name: "Updates & Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <Link href="/blog" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-navy"><ArrowLeft size={16} aria-hidden="true" /> Updates &amp; blog</Link>
    <article>
      <header className={`mx-auto max-w-3xl pb-7 pt-5 sm:pb-14 ${hasArrivalNotice(post) ? "arrival-heading mt-6" : ""}`}>
        <div className="flex flex-wrap items-center gap-3 text-sm text-steel"><Link href={`/blog?kind=${encodeURIComponent(post.kind)}`} className="inline-flex min-h-11 items-center rounded-full"><PostKindBadge post={post} /></Link><span>{readingMinutes(post.body)} min read</span></div>
        <h1 className="font-display mt-5 break-words text-3xl font-semibold leading-[1.15] tracking-tight text-navy sm:text-5xl lg:text-6xl">{post.title}</h1>
        <p className="mt-4 break-words text-base leading-relaxed text-ink-soft sm:text-xl">{post.excerpt}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hair pt-5 text-sm"><span className="font-medium text-navy">{post.author}</span>{post.place ? <span className="font-medium text-steel">· {post.place}</span> : null}<time className="text-steel" dateTime={post.date}>{formatDate(post.date)}</time></div>
      </header>
      {post.image ? <figure className="mb-12 overflow-hidden rounded-2xl border border-hair bg-navy-tint/40 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={publicMediaUrl(post.image)} alt={post.title} className="mx-auto max-h-[680px] w-auto max-w-full rounded-2xl object-contain" />
      </figure> : null}
      <div className="mx-auto max-w-3xl">
        {sections.length >= 3 ? <details className="mb-8 rounded-xl border border-hair bg-white p-4 sm:p-5"><summary className="min-h-11 cursor-pointer py-2 font-medium text-navy">In this article</summary><nav aria-label="In this article" className="mt-2"><ol className="space-y-1">{sections.map((section) => <li key={section.id}><a href={`#${section.id}`} className="inline-flex min-h-11 items-center text-sm text-navy underline underline-offset-4">{section.title}</a></li>)}</ol></nav></details> : null}
        <PostBody body={post.body} />
        <PostGallery images={post.gallery} title={post.title} />
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-y border-hair py-5 text-sm text-steel"><span>Published by {post.author}</span><Link className="inline-flex min-h-11 items-center gap-2 font-medium text-navy" href="/blog">All updates <ArrowRight size={16} aria-hidden="true" /></Link></footer>
        <aside className="mt-10 rounded-2xl bg-navy-tint p-6 sm:p-8"><h2 className="font-display text-2xl font-semibold text-navy">Have a question about equipment?</h2><p className="mt-3 max-w-[58ch] text-base leading-relaxed text-ink-soft">Ask us about the model, price, delivery time or support.</p><Link href="/quote" className="btn-outline mt-6">Request a quote <ArrowRight size={16} aria-hidden="true" /></Link></aside>
      </div>
    </article>
    {more.length ? <section aria-labelledby="more-posts" className="mt-16 border-t border-hair pt-10"><h2 id="more-posts" className="font-display text-3xl font-semibold text-navy">Keep reading</h2><div className="mt-6"><MobileCardRail label="More stories" columns={2}>{more.map((item) => <Link href={`/blog/${item.slug}`} key={item.id} className={`flex flex-col overflow-hidden rounded-xl border border-hair bg-white transition-colors hover:border-navy/40 ${hasArrivalNotice(item) ? "arrival-card" : ""}`}>{item.image ? <V2Photo src={item.image} label={item.title} className="aspect-video w-full" /> : null}<div className="p-5"><PostKindBadge post={item} /><p className="mt-3 text-xs text-steel">{formatDate(item.date)}</p><h3 className="font-display mt-3 break-words text-xl font-semibold text-navy">{item.title}</h3><p className="mt-3 line-clamp-3 break-words text-[15px] leading-relaxed text-ink-soft">{item.excerpt}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-navy">Read story <ArrowRight size={16} aria-hidden="true" /></span></div></Link>)}</MobileCardRail></div></section> : null}
  </div>
  );
}
