"use client";

import Link from "next/link";

export default function SiteError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <div className="mx-auto max-w-xl px-5 py-16">
    <h1 className="font-display text-3xl font-semibold text-navy">This page couldn’t load</h1>
    <p role="alert" className="mt-4 leading-relaxed text-ink-soft">Please try again. If the problem continues, contact our team for equipment enquiries and support.</p>
    <div className="action-stack mt-6"><button className="btn-primary min-h-11" onClick={retry}>Try again</button><Link href="/contact" className="btn-outline min-h-11">Contact us</Link></div>
  </div>;
}
