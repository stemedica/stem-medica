import type { CmsPost } from "@/lib/post-schema";
import { MobileCardRail } from "./MobileCardRail";
import { publicMediaUrl } from "@/lib/preview-paths";

export function PostGallery({ images, title, preview = false }: { images: CmsPost["gallery"]; title: string; preview?: boolean }) {
  if (!images?.length) return null;
  return <section aria-label="Article gallery" className="my-10 border-t border-hair pt-8">
    <div className="mb-5 flex items-baseline justify-between gap-3"><h2 className="font-display text-2xl font-semibold text-navy">In pictures</h2><span className="text-sm text-steel">{images.length} {images.length === 1 ? "image" : "images"}</span></div>
    <MobileCardRail label="Article pictures" columns={2}>
      {images.map((image, index) => <figure key={image.src} className="min-w-0">
        {/* Native images preserve authenticated media access in the admin preview. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview ? `/admin/api/media?id=${image.src.split("/").pop()}` : publicMediaUrl(image.src)} alt={image.alt || `${title} — gallery image ${index + 1}`} loading="lazy" decoding="async" className="aspect-[4/3] w-full rounded-xl border border-hair bg-navy-tint object-contain" />
        {image.caption ? <figcaption className="mt-3 break-words text-sm leading-relaxed text-ink-soft">{image.caption}</figcaption> : null}
      </figure>)}
    </MobileCardRail>
  </section>;
}
