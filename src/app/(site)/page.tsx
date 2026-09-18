import { PostKindBadge } from "@/components/PostKindBadge";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { V2Button, V2Photo, V2Head } from "@/components/V2";
import { getCatalogue } from "@/lib/catalogue";
import { getAllPosts, formatDate } from "@/lib/post-store";
import { site } from "@/lib/site";
import { HomeHero } from "@/components/HomeHero";
import { HomeEquipment } from "@/components/HomeEquipment";
import { homeEquipment } from "@/lib/home-equipment";
import { MobileCardRail } from "@/components/MobileCardRail";
import { hasArrivalNotice } from "@/lib/arrival-notice";
import { HomeEquipmentSkeleton, HomeUpdatesSkeleton } from "@/components/HomeSkeleton";
export const dynamic = "force-dynamic";

type CataloguePromise = ReturnType<typeof getCatalogue>;
type PostsPromise = ReturnType<typeof getAllPosts>;

async function EquipmentSection({ catalogue }: { catalogue: CataloguePromise }) {
  const { products, categories } = await catalogue;
  return <HomeEquipment groups={homeEquipment({ products, categories })} />;
}

async function UpdatesSection({ posts: postsPromise }: { posts: PostsPromise }) {
  const allPosts = await postsPromise;
  const posts = allPosts.slice(0, 6);

  if (posts.length === 0) return null;

  return <section aria-label="Latest updates and blog" className="mx-auto max-w-6xl px-5 pb-14 lg:pb-20">
    <V2Head
      title="The latest from STEM MEDICA"
      lede="Upcoming equipment and notes from our team."
    />
    <div className="mt-9"><MobileCardRail label="Latest updates">
      {posts.map((post) => (
        <Link prefetch={false} key={post.slug} href={`/blog/${post.slug}`} className={`v2-card group flex flex-col p-5 ${hasArrivalNotice(post) ? "arrival-card" : ""}`}>
          <V2Photo src={post.image || undefined} label={post.image ? post.title : `Cover image · ${post.title}`} className="mb-4 aspect-video w-full" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PostKindBadge post={post} />
            <span className="label text-steel tabular-nums">{formatDate(post.date)}</span>
          </div>
          <h3 className="font-display wdth-n mt-4 text-[17px] font-semibold leading-snug text-balance">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-[14.5px] leading-relaxed text-ink-soft">{post.excerpt}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-[14.5px] font-medium text-navy">
            Read
            <ArrowRight
              size={15}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </Link>
      ))}
    </MobileCardRail></div>
    <div className="mt-7"><V2Button href="/blog" variant="outline">View all updates</V2Button></div>
  </section>;
}

export default function Home() {
  // Start independent reads together; each section streams as soon as its data is ready.
  const catalogue = getCatalogue();
  const posts = getAllPosts();

  return (
    <>
      <HomeHero />

      <Suspense fallback={<HomeEquipmentSkeleton />}>
        <EquipmentSection catalogue={catalogue} />
      </Suspense>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-b border-hair px-5 py-6">
        <p className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-navy"><span>01 · Supply</span><span>02 · Installation</span><span>03 · Support</span></p>
        <Link href="/service" className="inline-flex min-h-11 items-center gap-3 text-sm font-medium text-navy underline underline-offset-4">Our approach <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>


      {/* Split: photo beside copy */}
      <section className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
        <div className="max-w-3xl">
          <div>
            <V2Head
              title="Medical equipment, with support"
              lede="Learn about STEM MEDICA and our approach to equipment supply, installation and support."
            />
            <div className="mt-7">
              <V2Button href="/about" badge>Read our story</V2Button>
            </div>
          </div>
        </div>
      </section>

      {/* Insights */}
      <Suspense fallback={<HomeUpdatesSkeleton />}>
        <UpdatesSection posts={posts} />
      </Suspense>

      {/* CTA */}
      <section className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="v2-frame v2-frame-dark relative isolate px-6 py-16 text-center sm:px-10 sm:py-20">
          <V2Head
            align="center"
            tone="dark"
            title="Tell us what your facility needs"
            lede="Share the equipment you’re looking for and our team will help with your enquiry."
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <V2Button href="/quote" badge>Request a quote</V2Button>
            <V2Button href={`tel:${site.phoneIntl}`} variant="glass">{site.phone}</V2Button>
          </div>
        </div>
      </section>
    </>
  );
}
