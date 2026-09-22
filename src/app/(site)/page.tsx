import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { V2Button, V2Photo, V2Head } from "@/components/V2";
import { getCatalogue } from "@/lib/catalogue";
import { site } from "@/lib/site";
import { HomeHero } from "@/components/HomeHero";
import { HomeAbout } from "@/components/HomeAbout";
import { FollowUs } from "@/components/FollowUs";
import { WaveField } from "@/components/WaveField";
import { ScrollRail } from "@/components/ScrollRail";
import { getStories } from "@/lib/story-store";
export const revalidate = 300;

export default async function Home() {
  const [catalogue, published] = await Promise.all([getCatalogue(), getStories()]);

  /* Achievements come from the admin. No hardcoded fallback: an invented
     project is worse than an absent section, so when nothing is published the
     row is not rendered at all. */
  const stories = published;

  return (
    <>
      <HomeHero />

      <HomeAbout categoryCount={catalogue.categories.length} />

      {/* Story cards, not a metrics row. The next card is deliberately part
          visible at the edge: the crop is what says the row continues. */}
      {stories.length ? <section aria-labelledby="stories" className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
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
          <ScrollRail label="Working with facilities" size="single">
            {stories.map((story) => (
              <article key={story.title} className="relative isolate flex aspect-[3/4] min-h-[440px] flex-col justify-end overflow-hidden rounded-2xl bg-navy-deep sm:aspect-[4/3] lg:aspect-[16/9]">
                {/* object-cover, so a portrait, landscape or odd-ratio upload
                    all fill the same frame rather than letterboxing. */}
                {story.image ? (
                  <V2Photo src={story.image} label={`${story.title}: photograph`} rounded={false} fill className="parallax-media" />
                ) : (
                  <span aria-hidden="true" className="absolute inset-0">
                    <svg className="h-full w-full text-white/10" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
                      <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </span>
                )}

                {/* The picture dissolves into the type rather than stopping at
                    a rule. Weighted to the foot, since that is the only part
                    carrying text. */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(8,24,48,.97)_0%,rgba(8,24,48,.88)_26%,rgba(8,24,48,.55)_48%,rgba(8,24,48,.12)_76%,transparent_100%)]" />

                <div className="relative p-6 sm:p-9 lg:p-11">
                  <p className="text-sm font-medium text-[#b9deec]">{story.place}</p>
                  <h3 className="font-display mt-2.5 max-w-[22ch] text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.12] tracking-[-.02em] text-white text-balance">
                    {story.title}
                  </h3>
                  <p className="mt-3.5 max-w-[62ch] text-base leading-relaxed text-white/85">{story.summary}</p>
                  {/* Only rendered when a post exists: a button that goes
                      nowhere is worse than none at all. */}
                  {story.postSlug ? (
                    <Link
                      prefetch={false}
                      href={`/blog/${story.postSlug}`}
                      className="group/read mt-7 inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-scarlet py-2 pl-6 pr-2 text-sm font-semibold text-white transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-vital hover:shadow-[0_10px_28px_rgba(196,55,46,.45)] active:translate-y-0"
                    >
                      Read the story
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-scarlet transition-transform duration-300 group-hover/read:translate-x-0.5">
                        <ArrowRight size={17} aria-hidden="true" />
                      </span>
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </ScrollRail>
        </div>
      </section> : null}

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
