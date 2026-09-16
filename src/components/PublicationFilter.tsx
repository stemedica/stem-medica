"use client";

export type PublicationStatus = "all" | "published" | "draft";
export function matchesPublication(published: boolean, status: PublicationStatus) {
  return status === "all" || (status === "published" ? published : !published);
}
export function PublicationFilter({ value, onChange }: { value: PublicationStatus; onChange: (value: PublicationStatus) => void }) {
  return <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
    {(["all", "published", "draft"] as const).map((status) => <button key={status} type="button" aria-pressed={value === status} onClick={() => onChange(status)} className="min-h-11 rounded-lg border border-hair px-3 py-2 text-sm aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white">{status === "all" ? "All" : status === "published" ? "Published" : "Drafts"}</button>)}
  </div>;
}
