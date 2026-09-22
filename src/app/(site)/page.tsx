import { ImageIcon } from "lucide-react";
import { V2Button, V2Photo, V2Head } from "@/components/V2";
import { getCatalogue } from "@/lib/catalogue";
import { site } from "@/lib/site";
import { HomeHero } from "@/components/HomeHero";
import { HomeAbout } from "@/components/HomeAbout";
import { FollowUs } from "@/components/FollowUs";
import { WaveField } from "@/components/WaveField";
import { ScrollRail } from "@/components/ScrollRail";
import { successStories } from "@/lib/success-stories";
import { getStories } from "@/lib/story-store";
export const revalidate = 300;

export default async function Home() {
  const [catalogue, published] = await Promise.all([getCatalogue(), getStories()]);

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
          <ScrollRail label="Working with facilities" size="feature">
            {stories.map((story) => (
              <article key={story.title} className="group flex flex-col overflow-hidden rounded-2xl border border-hair bg-white transition-[border-color,box-shadow] duration-300 hover:border-navy/40 hover:shadow-[0_18px_44px_rgba(15,37,85,.12)]">
                <div className="relative aspect-[3/2] overflow-hidden border-b border-hair bg-navy-deep">
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
                    <span aria-hidden="true" className="absolute inset-0">
                      <svg className="h-full w-full text-white/10" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
                        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
                      </svg>
                      <ImageIcon size={26} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/30" />
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="text-sm font-medium text-navy-2">{story.place}</p>
                  <h3 className="font-display mt-2 text-[clamp(1.35rem,2.2vw,1.75rem)] font-semibold leading-snug text-navy text-balance">{story.title}</h3>
                  <p className="mt-3.5 text-base leading-relaxed text-ink-soft">{story.summary}</p>
                </div>
              </article>
            ))}
          </ScrollRail>
        </div>
      </section>

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
