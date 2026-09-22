import { PostKindBadge } from "@/components/PostKindBadge";
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
function EquipmentSection({ products, categories }: Awaited<ReturnType<typeof getCatalogue>>) {
  return <HomeEquipment groups={homeEquipment({ products, categories })} />;
}

function UpdatesSection({ allPosts }: { allPosts: Awaited<ReturnType<typeof getAllPosts>> }) {
  const posts = allPosts.slice(0, 6);

  if (posts.length === 0) return null;

  return <section aria-label="Latest updates and blog" className="mx-auto max-w-6xl px-5 pb-14 lg:pb-20">
    <V2Head
      title="The latest from STEM MEDICA"
      lede="New equipment and practical updates from our team."
    />
    <div className="mt-9"><MobileCardRail label="Latest updates">
      {posts.map((post) => (
        <Link prefetch={false} key={post.slug} href={`/blog/${post.slug}`} className={`v2-card group flex flex-col p-5 ${hasArrivalNotice(post) ? "arrival-card" : ""}`}>
          {post.image ? <V2Photo src={post.image} label={post.title} className="mb-4 aspect-video w-full" /> : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PostKindBadge post={post} />
            <span className="label text-steel tabular-nums">{formatDate(post.date)}</span>
          </div>
          <h3 className="font-display wdth-n mt-4 text-[17px] font-semibold leading-snug text-balance">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-[15px] leading-relaxed text-ink-soft">{post.excerpt}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-navy">
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

/** Drawn from the service page, so the homepage cannot drift from it. */
const SUPPORT: [string, string][] = [
  ["Installation", "Installed and commissioned at your facility, coordinated with delivery and shipping."],
  ["Spare parts", "Spare parts, consumables and accessories supplied after handover."],
  ["Technical support", "Ongoing assistance for your team, and a response when equipment needs attention."],
];

export const revalidate = 300;

export default async function Home() {
  const [catalogue, allPosts] = await Promise.all([getCatalogue(), getAllPosts()]);

  return (
    <>
      <HomeHero />

      <EquipmentSection {...catalogue} />

      {/* What happens after the order. Numbered steps said nothing the words
          themselves did not, so this names the three services instead. */}
      <section aria-labelledby="support-band" className="border-y border-hair bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:py-16">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <h2 id="support-band" className="font-display max-w-[22ch] text-2xl font-semibold leading-tight tracking-tight text-navy text-balance sm:text-3xl">
              Supply is where we start, not where we stop
            </h2>
            <Link href="/service" className="inline-flex min-h-11 items-center gap-2.5 text-sm font-semibold text-navy underline underline-offset-4">
              How we support you <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-3">
            {SUPPORT.map(([term, detail]) => (
              <div key={term} className="border-t border-navy/30 pt-4">
                <dt className="font-display text-lg font-semibold text-navy">{term}</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-ink-soft">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>


      {/* Heading and body sit side by side so this reads as a statement rather
          than another centred block in the stack. */}
      <section aria-labelledby="mission" className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <h2 id="mission" className="font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.06] tracking-[-.03em] text-navy text-balance">
            Advancing healthcare across Ethiopia
          </h2>
          <div className="lg:pt-3">
            <p className="max-w-[62ch] text-lg leading-relaxed text-ink-soft">
              We believe in collaboration and innovation. By importing and distributing quality medical products, we help health facilities access the equipment and support they need.
            </p>
            <div className="mt-8"><V2Button href="/about" badge>Read our story</V2Button></div>
          </div>
        </div>
      </section>

      {/* Insights */}
      <UpdatesSection allPosts={allPosts} />

      {/* CTA */}
      <section className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="v2-frame v2-frame-dark relative isolate px-6 py-16 text-center sm:px-10 sm:py-20">
          <V2Head
            align="center"
            tone="dark"
            title="Let’s improve healthcare together"
            lede="Tell us what your facility needs. We’ll help you choose the right equipment and prepare a quote."
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
