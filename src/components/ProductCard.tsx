import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CmsProduct } from "@/lib/cms-schema";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { AvailabilityTag } from "./AvailabilityTag";

/**
 * Catalogue entry styled as an equipment nameplate: squared, hairline-bordered,
 * with the index stamped in the corner and the data row set in mono.
 */
export function ProductCard({ product, index, categoryName = "" }: {
  product: CmsProduct;
  index: number;
  /** Resolved from the product's category slug by the caller. */
  categoryName?: string;
}) {
  const cls = "group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-hair bg-white transition-colors hover:border-navy/50";

  const body = (
    <>
      {product.image ? <div className="relative border-b border-hair">
        <ImagePlaceholder src={product.image} label={`${product.name}: product photo`} ratio="16/10" className="border-0" />
        <span className="stamp absolute bottom-2 right-3 text-3xl text-navy/10">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div> : null}

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display wdth-n text-[17px] font-semibold leading-snug text-balance transition-colors group-hover:text-navy">
          {product.name}
        </h3>
        {product.summary ? <p className="mt-2 line-clamp-3 flex-1 text-[15px] leading-relaxed text-ink-soft">
          {product.summary}
        </p> : null}

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-hair pt-3.5 font-mono text-[11px]">
          {categoryName ? <div className="col-span-2">
            <dt className="text-steel">Category</dt>
            <dd className="mt-0.5 break-words font-medium text-navy">{categoryName}</dd>
          </div> : null}
          <div>
            <dt className="text-steel">Brand</dt>
            <dd className="mt-0.5 break-words text-ink">{product.brand}</dd>
          </div>
          {product.origin ? <div>
            <dt className="text-steel">Origin</dt>
            <dd className="mt-0.5 break-words text-ink">{product.origin}</dd>
          </div> : null}
        </dl>

        <div className="mt-4">
          <AvailabilityTag availability={product.availability} />
        </div>

        <span className="label mt-4 inline-flex items-center gap-2 font-semibold text-navy">
          View equipment
          <ArrowRight
            size={13}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </>
  );

  return (
    <Link prefetch={false} href={`/products/${product.slug}`} className={cls}>
      {body}
    </Link>
  );
}
