import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/content/products";
import { ImagePlaceholder } from "./ImagePlaceholder";

/**
 * Catalogue entry styled as an equipment nameplate: squared, hairline-bordered,
 * with the index stamped in the corner and the data row set in mono.
 */
export function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="plate plate-hover lift group flex flex-col overflow-hidden"
    >
      <div className="relative border-b border-hair">
        <ImagePlaceholder label={`${product.name}: product photo`} ratio="16/10" className="border-0" />
        <span className="stamp absolute bottom-2 right-3 text-3xl text-navy/10">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display wdth-n text-[17px] font-semibold leading-snug text-balance transition-colors group-hover:text-navy">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-soft">
          {product.summary}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-hair pt-3.5 font-mono text-[11px]">
          <div>
            <dt className="text-steel">Brand</dt>
            <dd className="mt-0.5 truncate text-ink">{product.brand}</dd>
          </div>
          <div>
            <dt className="text-steel">Origin</dt>
            <dd className="mt-0.5 truncate text-ink">{product.origin}</dd>
          </div>
        </dl>

        <span className="label mt-4 inline-flex items-center gap-2 font-semibold text-navy">
          Specification
          <ArrowRight
            size={13}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
