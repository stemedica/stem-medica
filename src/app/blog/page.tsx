import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/Section";
import { getAllPosts, formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Installation logs, procurement checklists and clinical briefs from STEM MEDICA's biomedical engineers.",
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <Section
      index="01"
      label="Insights"
      meta={`${String(posts.length).padStart(2, "0")} posts`}
      title="Notes from the field"
      lede="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    >
      <div className="mt-12 border-t border-hair">
        {posts.map((post, i) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group grid grid-cols-[3rem_1fr] gap-x-5 border-b border-hair py-7 transition-colors hover:bg-navy-tint/35 sm:grid-cols-[5rem_1fr_auto] sm:gap-x-8"
          >
            <span className="stamp pt-1 text-xl text-scarlet">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <div className="label flex flex-wrap items-baseline gap-x-4 text-steel">
                <span className="text-navy">{post.kind}</span>
                <span className="tabular-nums">{formatDate(post.date)}</span>
                <span>{post.author}</span>
              </div>
              <h2 className="font-display wdth-n mt-2.5 max-w-[30ch] text-xl font-semibold leading-snug text-balance">
                {post.title}
              </h2>
              <p className="mt-2 max-w-[66ch] text-[15px] leading-relaxed text-ink-soft">
                {post.excerpt}
              </p>
            </div>
            <span className="col-start-2 mt-4 flex items-center gap-2 self-start sm:col-start-3 sm:mt-1">
              <span className="label font-semibold text-navy">Read</span>
              <ArrowRight
                size={14}
                aria-hidden="true"
                className="text-navy transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
