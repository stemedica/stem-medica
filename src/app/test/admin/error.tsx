"use client";

import Link from "next/link";

export default function AdminError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main className="mx-auto max-w-xl px-5 py-16">
    <h1 className="font-display text-2xl font-semibold text-navy">We couldn’t display this page</h1>
    <p role="alert" className="mt-3 text-ink-soft">Please try again. Saved content is not affected, but changes you hadn’t saved may need to be entered again.</p>
    <div className="mt-6 flex flex-wrap gap-3"><button className="btn-primary" onClick={retry}>Try again</button><Link className="btn-outline" href="/test/admin">Back to dashboard</Link></div>
  </main>;
}
