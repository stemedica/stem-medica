import { BuilderClient } from "../BuilderClient";
import { ProformaStyles } from "../styles";
import { requireAdminPage } from "@/lib/auth/guard";

export default async function ProformasPage() {
  await requireAdminPage();
  return (
    <>
      <ProformaStyles />
      <div className="proforma-shell min-h-screen bg-paper">
        <header className="no-print border-b border-hair bg-white">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4">
            <div>
              <div className="label text-steel">STEM MEDICA · Quotations</div>
              <h1 className="font-display wdth-w mt-1 text-xl font-bold uppercase tracking-tight">
                Proforma builder
              </h1>
              <p className="mt-2 max-w-xl text-sm text-ink-soft">Add your client and items, enter prices manually, then save a draft or export a PDF.</p>
            </div>
            <span className="label border border-hair px-2.5 py-1.5 text-steel">
              Not indexed
            </span>
          </div>
        </header>
        <div className="proforma-workspace mx-auto max-w-[1500px] px-5 py-8">
          <BuilderClient />
        </div>
      </div>
    </>
  );
}
