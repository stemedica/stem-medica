import Link from "next/link";

export default function NotFound() {
  return <div className="mx-auto max-w-xl px-5 py-16">
    <p className="label text-steel">Page not found</p>
    <h1 className="font-display mt-4 text-3xl font-semibold text-navy">This page isn’t available</h1>
    <p className="mt-4 leading-relaxed text-ink-soft">The link may have changed, or the content may no longer be published. Browse our catalogue or read the latest updates.</p>
    <div className="mt-6 flex flex-wrap gap-3"><Link href="/products" className="btn-primary min-h-11">Browse equipment</Link><Link href="/blog" className="btn-outline min-h-11">Updates &amp; blog</Link></div>
  </div>;
}
