import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { homeEquipment } from "@/lib/home-equipment";

/**
 * The catalogue as a directory set at display scale.
 *
 * Still plain links — a department stays shareable and crawlable — but the
 * type does the work rather than a grid of tiles. Each row fills its width,
 * and the hover state washes the row navy and drives the name wide on
 * Archivo's width axis, so the whole line responds rather than an icon.
 */
export function HomeEquipment({ groups }: { groups: ReturnType<typeof homeEquipment> }) {
  const [all, ...categories] = groups;
  const listed = categories.filter(category => category.count);

  return <section id="equipment" aria-labelledby="equipment-heading" className="border-b border-hair bg-paper px-5 py-20 sm:px-6 lg:py-28">
    <div className="mx-auto max-w-6xl">
      <div className="reveal flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <h2 id="equipment-heading" className="font-display wdth-w max-w-[14ch] text-[clamp(2.2rem,4.6vw,3.9rem)] font-semibold leading-[1.04] tracking-[-.035em] text-navy text-balance">
          Every department, one supplier<span className="text-scarlet">.</span>
        </h2>
        <Link prefetch={false} href="/products" className="group inline-flex min-h-12 items-center gap-3 rounded-full border border-navy px-6 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white">
          All {all.count} items
          <ArrowUpRight size={17} aria-hidden="true" className="transition-transform duration-300 group-hover:rotate-45" />
        </Link>
      </div>

      {listed.length ? (
        <ul className="reveal mt-12 border-t border-navy/20 lg:mt-16">
          {listed.map(category => (
            <li key={category.slug}>
              <Link
                prefetch={false}
                href={`/products?cat=${encodeURIComponent(category.slug)}`}
                className="group relative flex min-h-16 items-center justify-between gap-5 overflow-hidden border-b border-navy/20 px-3 py-4 transition-colors duration-300 hover:bg-navy sm:px-5"
              >
                <span className="font-display wdth-n min-w-0 truncate text-[clamp(1.15rem,2.6vw,1.9rem)] font-semibold leading-tight text-navy transition-[color,font-variation-settings] duration-300 group-hover:text-white group-hover:[font-variation-settings:'wdth'_112]">
                  {category.name}
                </span>
                <span className="flex shrink-0 items-center gap-4">
                  <span className="label text-steel transition-colors duration-300 group-hover:text-white/70">{category.count}</span>
                  <span className="flex size-9 items-center justify-center rounded-full border border-navy/30 text-navy transition-[transform,background-color,border-color,color] duration-300 group-hover:border-white group-hover:bg-white group-hover:text-navy group-hover:rotate-45">
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="reveal mt-12 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
          Our catalogue is being updated. Please check back soon, or contact us and we will source what you need.
        </p>
      )}
    </div>
  </section>;
}
