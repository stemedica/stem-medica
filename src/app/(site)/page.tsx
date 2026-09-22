import { PostKindBadge } from "@/components/PostKindBadge";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ImageIcon } from "lucide-react";
import { V2Button, V2Photo, V2Head } from "@/components/V2";
import { getCatalogue } from "@/lib/catalogue";
import { getAllPosts, formatDate } from "@/lib/post-store";
import { site } from "@/lib/site";
import { HomeHero } from "@/components/HomeHero";
import { HomeEquipment } from "@/components/HomeEquipment";
import { HomeAbout } from "@/components/HomeAbout";
import { FollowUs } from "@/components/FollowUs";
import { WaveField } from "@/components/WaveField";
import { ScrollRail } from "@/components/ScrollRail";
import { successStories } from "@/lib/success-stories";
import { getStories } from "@/lib/story-store";
import { homeEquipment } from "@/lib/home-equipment";
import { hasArrivalNotice } from "@/lib/arrival-notice";
function EquipmentSection({ products, categories }: Awaited<ReturnType<typeof getCatalogue>>) {
  return <HomeEquipment groups={homeEquipment({ products, categories })} />;
}

function UpdatesSection({ allPosts }: { allPosts: Awaited<ReturnType<typeof getAllPosts>> }) {
  const posts = allPosts.slice(0, 8);

  if (posts.length === 0) return null;

  return <section aria-labelledby="updates" className="mx-auto max-w-6xl px-5 pb-20 lg:pb-28">
    <div className="reveal flex flex-wrap items-end justify-between gap-x-10 gap-y-5 border-t border-navy/20 pt-10">
      <div className="max-w-2xl">
        <h2 id="updates" className="font-display wdth-w text-[clamp(2.2rem,4.6vw,3.9rem)] font-semibold leading-[1.04] tracking-[-.035em] text-navy">
          The latest from <span className="whitespace-nowrap">STEM MEDICA<span className="text-scarlet">.</span></span>
        </h2>
        <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-ink-soft">New equipment and practical updates from our team.</p>
      </div>
      <Link prefetch={false} href="/blog" className="group inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full border border-navy px-6 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white">
        All updates
        <ArrowUpRight size={17} aria-hidden="true" className="transition-transform duration-300 group-hover:rotate-45" />
      </Link>
    </div>

    <div className="reveal mt-12"><ScrollRail label="Latest updates" size="narrow">
      {posts.map((post) => (
        <Link
          prefetch={false}
          key={post.slug}
          href={`/blog/${post.slug}`}
          className={`group flex flex-col overflow-hidden rounded-2xl border border-hair bg-white transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-navy/40 hover:shadow-[0_18px_44px_rgba(15,37,85,.12)] ${hasArrivalNotice(post) ? "arrival-card" : ""}`}
        >
          {/* Posts without a picture show none — a placeholder panel here was
              asked against, and the card reads fine as text alone. */}
          {post.image ? <div className="relative overflow-hidden border-b border-hair">
            <V2Photo src={post.image} label={post.title} rounded={false} className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-[1.04]" />
          </div> : null}
          <div className="flex flex-1 flex-col p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <PostKindBadge post={post} />
              <span className="label tabular-nums text-steel">{formatDate(post.date)}</span>
            </div>
            <h3 className="font-display mt-4 text-[19px] font-semibold leading-snug text-navy text-balance">
              {post.title}
            </h3>
            <p className="mt-2.5 line-clamp-3 flex-1 text-[15px] leading-relaxed text-ink-soft">{post.excerpt}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-navy">
              Read
              <ArrowRight size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      ))}
    </ScrollRail></div>
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
  const [catalogue, allPosts, published] = await Promise.all([getCatalogue(), getAllPosts(), getStories()]);

  /* Real achievements once Geremew has entered them in the admin. Until then
     the cards describe the work rather than claiming a project that has not
     been supplied, so the row is never empty and never invented. */
  const stories = published.length
    ? published.map((story) => ({ title: story.title, place: story.place, summary: story.summary, image: story.image || undefined }))
    : successStories;

  return (
    <>
      <HomeHero />

      <HomeAbout categoryCount={catalogue.categories.length} />

      <EquipmentSection {...catalogue} />

      {/* What happens after the order. Numbered steps said nothing the words
          themselves did not, so this names the three services instead. */}
      <section aria-labelledby="support-band" className="border-y border-hair bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:py-16">
          <div className="reveal flex flex-wrap items-end justify-between gap-5">
            <h2 id="support-band" className="font-display wdth-w max-w-[18ch] text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.05] tracking-[-.035em] text-navy text-balance">
              Supply is where we start, not where we stop
            </h2>
            <Link href="/service" className="inline-flex min-h-11 items-center gap-2.5 text-sm font-semibold text-navy underline underline-offset-4">
              How we support you <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          {/* An ECG baseline carrying a pulse at each service and running on
              past the last one. The section's claim, drawn: geometry from the
              site's own motif, not a picture. */}
          <div className="relative mt-14 pt-12 lg:mt-16">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-12">
              <svg viewBox="0 0 1200 48" preserveAspectRatio="none" fill="none" className="h-full w-full text-navy/35">
                <path
                  className="supply-trace"
                  d="M0 24 H150 l9 0 6 -15 8 28 6 -22 8 9 H520 l9 0 6 -15 8 28 6 -22 8 9 H900 l9 0 6 -15 8 28 6 -22 8 9 H1200"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            <dl className="reveal-stagger grid gap-x-10 gap-y-12 sm:grid-cols-3">
              {SUPPORT.map(([term, detail]) => (
                <div key={term} className="reveal relative">
                  <span aria-hidden="true" className="absolute -top-12 left-0 flex h-12 items-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" className="text-scarlet">
                      <circle cx="7.5" cy="7.5" r="7" fill="white" stroke="currentColor" strokeWidth="1.25" />
                      <circle cx="7.5" cy="7.5" r="2.75" fill="currentColor" />
                    </svg>
                  </span>
                  <dt className="font-display text-xl font-semibold leading-tight text-navy">{term}</dt>
                  <dd className="mt-2.5 max-w-[38ch] text-[15px] leading-relaxed text-ink-soft">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Story cards, not a metrics row. The next card is deliberately part
          visible at the edge: the crop is what says the row continues. */}
      <section aria-labelledby="stories" className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
        <div className="reveal flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          {/* The two halves each stay whole: "Achievements" split across a line
              break at this size, which a max-width in ch could not prevent. */}
          <h2 id="stories" className="font-display wdth-w max-w-[20ch] text-[clamp(2.2rem,4.6vw,3.9rem)] font-semibold leading-[1.04] tracking-[-.035em] text-navy">
            <span className="whitespace-nowrap">Working with</span>{" "}
            <span className="whitespace-nowrap">facilities<span className="text-scarlet">.</span></span>{" "}
            <span className="whitespace-nowrap">
              <span aria-hidden="true" className="mr-3 font-normal text-hair">|</span>
              <span className="text-steel">Achievements</span>
            </span>
          </h2>
          <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-ink-soft">
            What we supply, install and keep running — from a single theatre to a whole laboratory.
          </p>
        </div>
        <div className="reveal mt-12 lg:mt-16">
          <ScrollRail label="Working with facilities">
            {stories.map((story) => (
              <article key={story.title} className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-navy-deep">
                {/* The shared placeholder captions itself, which would repeat
                    the title printed directly beneath it. Without a photo the
                    card shows the marked panel alone. */}
                {story.image ? (
                  <V2Photo
                    src={story.image}
                    label={`${story.title}: photograph`}
                    rounded={false}
                    fill
                    className="parallax-media"
                  />
                ) : (
                  <span aria-hidden="true" className="absolute inset-0 bg-navy-deep">
                    <svg className="h-full w-full text-white/10" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
                      <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <ImageIcon size={24} className="absolute left-1/2 top-[30%] -translate-x-1/2 text-white/30" />
                  </span>
                )}
                {/* A scrim rather than a flat tint: the text sits at the foot of
                    the card, so only the foot needs to carry it. */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(8,24,48,.96)_0%,rgba(8,24,48,.78)_32%,rgba(8,24,48,.12)_72%,transparent_100%)]" />
                <div className="relative p-6">
                  <p className="text-sm font-medium text-[#b9deec]">{story.place}</p>
                  <h3 className="font-display mt-2 text-[22px] font-semibold leading-snug text-white text-balance">{story.title}</h3>
                  <p className="mt-3 line-clamp-4 text-[15px] leading-relaxed text-white/75">{story.summary}</p>
                </div>
              </article>
            ))}
          </ScrollRail>
        </div>
      </section>

      {/* Insights */}
      <UpdatesSection allPosts={allPosts} />

      {/* CTA */}
      <section className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="reveal v2-frame v2-frame-dark relative isolate px-6 py-16 text-center sm:px-10 sm:py-20">
          <WaveField className="opacity-60" />
          <V2Head
            align="center"
            tone="dark"
            title="Let’s improve healthcare together"
            lede="Tell us what your facility needs. We’ll help you choose the right equipment and prepare a quote."
          />
          <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-3">
            <V2Button href="/quote" badge>Request a quote</V2Button>
            <V2Button href={`tel:${site.phoneIntl}`} variant="glass">{site.phone}</V2Button>
          </div>
        </div>
      </section>

      <FollowUs />
      <div aria-hidden="true" className="scroll-progress" />
    </>
  );
}
