import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { homeEquipment } from "@/lib/home-equipment";

/**
 * An index, not a showcase.
 *
 * Someone arriving here wants their department, so the shortest path is the
 * list of departments. Everything that was not doing that job is gone: the
 * card grid said little with six near-identical placeholders, and the
 * dropdowns that replaced it hid the whole catalogue behind two clicks.
 *
 * These are plain links again, so a category is shareable and crawlable.
 */
export function HomeEquipment({ groups }: { groups: ReturnType<typeof homeEquipment> }) {
  const [all, ...categories] = groups;
  const listed = categories.filter(category => category.count);

  return <section id="equipment" aria-labelledby="equipment-heading" className="border-b border-hair bg-white px-5 py-16 sm:px-6 lg:py-24">
    <div className="mx-auto max-w-6xl">
      <div className="reveal flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h2 id="equipment-heading" className="font-display text-3xl font-semibold leading-[1.06] tracking-[-.03em] text-navy sm:text-4xl lg:text-5xl">
            Explore our equipment<span className="text-navy-2">.</span>
          </h2>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-ink-soft">
            Browse by department. Ask us to confirm the model, price and delivery time.
          </p>
        </div>
        <Link prefetch={false} href="/products" className="inline-flex min-h-11 items-center gap-2.5 text-sm font-semibold text-navy underline underline-offset-4">
          All {all.count} items<ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {listed.length ? (
        <ul className="reveal mt-10 grid border-t border-hair sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {listed.map(category => (
            <li key={category.slug}>
              <Link
                prefetch={false}
                href={`/products?cat=${encodeURIComponent(category.slug)}`}
                className="group flex min-h-14 items-center justify-between gap-4 border-b border-hair py-3.5 transition-colors sm:pr-6"
              >
                <span className="min-w-0 truncate font-display text-lg font-semibold text-navy transition-colors group-hover:text-navy-2">{category.name}</span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="text-sm tabular-nums text-steel">{category.count}</span>
                  <ArrowRight size={18} aria-hidden="true" className="text-hair transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-navy-2" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="reveal mt-10 max-w-[52ch] text-base leading-relaxed text-ink-soft">
          Our catalogue is being updated. Please check back soon, or contact us and we will source what you need.
        </p>
      )}
    </div>
  </section>;
}
