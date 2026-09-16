"use client";

import dynamic from "next/dynamic";

/**
 * The builder uses browser printing and creates a fresh random draft reference.
 * Draft persistence goes through the authenticated API, not browser storage.
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
