import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { V2Photo } from "./V2";
import { site } from "@/lib/site";

/**
 * The company, stated at full scale.
 *
 * Sits directly under the hero, so it carries the weight of an opening
 * statement: the heading runs at display size on Archivo's wide axis, and the
 * photograph is given real area rather than a thumbnail beside a link.
 *
 * Every sentence is taken from the about page, so the two cannot drift, and
 * the figure in the panel is read from the catalogue rather than asserted.
 */
export function HomeAbout({ categoryCount }: { categoryCount: number }) {
  return <section aria-labelledby="about" className="border-b border-hair bg-white px-5 py-20 sm:px-6 lg:py-28">
    <div className="mx-auto max-w-6xl">
      <h2 id="about" className="reveal font-display wdth-w max-w-[18ch] text-[clamp(2.4rem,5.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-.035em] text-navy text-balance">
        Closing the healthcare technology gap<span className="text-scarlet">.</span>
      </h2>

      <div className="reveal mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:items-start lg:gap-16">
        <V2Photo
          label="STEM MEDICA team at work"
          rounded={false}
          className="aspect-[4/3] w-full rounded-2xl lg:aspect-[5/4]"
        />

        <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
          <p>
            STEM MEDICA is a registered medical importing company distributing medical supplies, devices and equipment across Ethiopia.
          </p>
          <p>
            Ethiopia faces a significant gap in healthcare technology and access to quality medical supplies. We focus on quality and affordability so more hospitals, clinics, laboratories and health professionals can reach the technology they need.
          </p>
          <p>
            Our mission is to advance medical research and development and improve healthcare outcomes across the country — through collaboration, innovation, and product support that does not stop at delivery.
          </p>
          <Link prefetch={false} href="/about" className="group mt-2 inline-flex min-h-13 items-center gap-4 rounded-full bg-navy py-2 pl-6 pr-2 text-sm font-semibold text-white transition-colors hover:bg-navy-deep">
            Read our story
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight size={17} aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>

      {/* Three checkable statements. The figure is read from the catalogue so
          it cannot drift; nothing here is a total nobody has supplied. */}
      <dl className="reveal-stagger mt-16 grid overflow-hidden rounded-2xl border border-hair bg-paper divide-y divide-hair sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:mt-20">
        {([
          ["Registered importer", "Working with manufacturers and exporters to bring equipment into Ethiopia."],
          [`${categoryCount} departments supplied`, "Monitoring and emergency care through imaging, laboratory and dental."],
          ["Addis Ababa, nationwide", `Based in ${site.city.split(",")[0]}, delivering and supporting facilities around the country.`],
        ] as [string, string][]).map(([term, detail]) => (
          <div key={term} className="reveal p-6 lg:p-7">
            <dt className="font-display text-lg font-semibold text-navy">{term}</dt>
            <dd className="mt-2 text-[15px] leading-relaxed text-ink-soft">{detail}</dd>
          </div>
        ))}
      </dl>
    </div>
  </section>;
}
