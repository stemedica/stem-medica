import { Mail, Phone } from "lucide-react";
import { requireAdminPage } from "@/lib/auth/guard";
import { listEnquiries } from "@/lib/content-database";

const date = new Intl.DateTimeFormat("en-ET", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Addis_Ababa" });

export default async function EnquiriesPage() {
  await requireAdminPage();
  const enquiries = await listEnquiries();
  return <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
    <header className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">Quotation requests</h1>
      <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-ink-soft">Requests submitted through the website, newest first. Contact the requester by phone or email.</p>
    </header>
    {enquiries.length === 0 ? <section className="mt-8 rounded-xl border border-hair bg-white p-6 sm:p-8">
      <h2 className="font-display text-xl font-semibold text-navy">No requests yet</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">Quotation and partnership requests will appear here after a visitor sends the form.</p>
    </section> : <ol className="mt-8 grid gap-4">
      {enquiries.map((enquiry) => <li key={enquiry.id} className="min-w-0 rounded-xl border border-hair bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${enquiry.kind === "partnership" ? "bg-navy-tint text-navy" : "bg-scarlet-tint text-vital"}`}>
              {enquiry.kind === "partnership" ? "Partnership" : "Quotation"}
            </span>
            <h2 className="font-display mt-2 break-words text-xl font-semibold text-navy">{enquiry.facility}</h2>
            <p className="mt-1 break-words text-sm text-ink-soft">{enquiry.contact}</p>
          </div>
          <time className="shrink-0 text-xs tabular-nums text-steel" dateTime={enquiry.createdAt.toISOString()}>{date.format(enquiry.createdAt)}</time>
        </div>
        <dl className="mt-5 grid gap-4 border-y border-hair py-4 sm:grid-cols-2">
          <div><dt className="text-xs font-medium text-steel">{enquiry.kind === "partnership" ? "Products offered" : "Equipment"}</dt><dd className="mt-1 break-words text-sm text-ink">{enquiry.equipment}</dd></div>
          {enquiry.kind === "partnership" ? null : <div><dt className="text-xs font-medium text-steel">Quantity</dt><dd className="mt-1 text-sm tabular-nums text-ink">{enquiry.quantity ?? "Not specified"}</dd></div>}
          {enquiry.notes ? <div className="sm:col-span-2"><dt className="text-xs font-medium text-steel">Notes</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{enquiry.notes}</dd></div> : null}
        </dl>
        <div className="action-stack mt-5">
          <a className="btn-primary" href={`tel:${enquiry.phone}`}><Phone size={15} aria-hidden="true" /> Call {enquiry.phone}</a>
          {enquiry.email ? <a className="btn-outline" href={`mailto:${enquiry.email}`}><Mail size={15} aria-hidden="true" /> Email requester</a> : null}
        </div>
      </li>)}
    </ol>}
  </main>;
}
