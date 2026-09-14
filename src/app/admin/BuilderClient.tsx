"use client";

import dynamic from "next/dynamic";

/**
 * The builder is a browser-only tool: it reads and writes localStorage and
 * drives window.print(). Skipping prerender lets it initialise state straight
 * from storage instead of rendering defaults and correcting them in an effect.
 *
 * `ssr: false` only works inside a Client Component, hence this wrapper.
 */
const Builder = dynamic(() => import("./Builder").then((m) => m.Builder), {
  ssr: false,
  loading: () => (
    <p className="label py-20 text-center text-steel">Loading builder…</p>
  ),
});

export function BuilderClient() {
  return <Builder />;
}
