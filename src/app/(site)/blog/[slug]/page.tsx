import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Phone } from "lucide-react";
import { EcgRule, SectionHead } from "@/components/Section";
import { WaveField } from "@/components/WaveField";
import { Button } from "@/components/Button";
import { getPost, getPostSlugs, getAllPosts, formatDate } from "@/lib/posts";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const more = getAllPosts().filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <div className="relative overflow-hidden bg-navy-deep text-on-navy">
        <WaveField />
        <div className="relative mx-auto max-w-3xl px-5 py-12 sm:py-16">
          <Link href="/blog" className="label inline-flex items-center gap-2 text-scarlet-lift">
            <ArrowLeft size={13} aria-hidden="true" /> Insights
          </Link>
          <div className="label mt-8 flex flex-wrap gap-x-6 gap-y-1 text-on-navy/50">
            <span className="text-on-navy">{post.kind}</span>
            <span className="tabular-nums">{formatDate(post.date)}</span>
            <span>{post.author}</span>
          </div>
          <h1 className="font-display wdth-w mt-4 text-[2rem] font-bold uppercase leading-[1] tracking-[-0.03em] text-balance sm:text-[2.75rem]">
            {post.title}
          </h1>
          <div className="mt-7 h-0.5 w-16 bg-scarlet" />
        </div>
      </div>

      <EcgRule />

      <article className="mx-auto max-w-3xl px-5 py-14">
        <p className="border-l-2 border-scarlet pl-5 text-lg leading-relaxed text-ink">
          {post.excerpt}
        </p>
        <div
          className="prose-sm-ink mt-9 text-[16.5px]"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <aside className="plate ticks mt-14 p-6">
          <div className="label text-steel">Enquiry</div>
          <h2 className="font-display wdth-n mt-2.5 text-xl font-semibold">Talk to an engineer</h2>
          <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="mt-6">
            <Button href={`tel:${site.phoneIntl}`}>
              <Phone size={14} aria-hidden="true" /> Call {site.phone}
            </Button>
          </div>
        </aside>

        {more.length > 0 ? (
          <div className="mt-16">
            <SectionHead index="//" label="Keep reading" meta={`${more.length} more`} />
            <div className="mt-5 border-t border-hair">
              {more.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex items-baseline justify-between gap-5 border-b border-hair py-4 transition-colors hover:bg-navy-tint/35"
                >
                  <div>
                    <div className="label text-scarlet">{p.kind}</div>
                    <h3 className="font-display wdth-n mt-1.5 font-semibold leading-snug">{p.title}</h3>
                  </div>
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="shrink-0 text-navy transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </article>
    </>
  );
}
