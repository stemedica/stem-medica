import { money, lineTotal, totals, type Issuer, type Proforma } from "./proforma";
import { memo } from "react";

/**
 * The document itself. One component renders both the on-screen preview and the
 * printed/exported page, so what you see is exactly what is issued.
 */
export const ProformaDoc = memo(function ProformaDoc({ issuer, p }: { issuer: Issuer; p: Proforma }) {
  const t = totals(p);

  return (
    <article id="proforma-doc" className="pf">
      <header className="pf-head">
        <div className="pf-brand">
          {/* A plain image is intentional: the same markup is embedded into Word exports. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="pf-logo" />
          <span>{issuer.name || "STEM MEDICA"}</span>
        </div>
      </header>

      <h1 className="pf-document-title">Proforma Invoice</h1>

      <dl className="pf-meta">
        <div><dt>Proforma Invoice No.:</dt><dd>{p.number || "—"}</dd></div>
        <div><dt>Date:</dt><dd>{p.date || "—"}</dd></div>
      </dl>

      <section className="pf-parties">
        <div className="pf-from">
          <p className="pf-party-label">From :</p>
          <strong>{issuer.name || "—"}</strong>
          {issuer.address ? <span>{issuer.address}</span> : null}
          {issuer.phone ? <span>Tel: {issuer.phone}</span> : null}
          {issuer.email ? <span>Email: {issuer.email}</span> : null}
          {issuer.tin ? <span>TIN No: {issuer.tin}</span> : null}
          {issuer.vatReg ? <span>VAT Reg. No: {issuer.vatReg}</span> : null}
        </div>

        <div className="pf-to">
          <strong>To : {p.client.name || "—"}</strong>
          {p.client.attn ? <span>Attn: {p.client.attn}</span> : null}
          {p.client.address ? <span>{p.client.address}</span> : null}
          {p.client.tin ? <span>TIN No: {p.client.tin}</span> : null}
        </div>
      </section>

      <section className="pf-table-block">
        <h2>Product / Service Details</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="pf-watermark" />
        <table className="pf-items">
          <thead>
            <tr>
              <th className="n">No</th>
              <th>Description</th>
              <th>Unit</th>
              <th className="n">Qty</th>
              <th className="r">Unit Price</th>
              <th className="r">Total ({p.currency})</th>
            </tr>
          </thead>
          <tbody>
            {p.items.map((i, n) => (
              <tr key={i.id}>
                <td className="n">{n + 1}</td>
                <td>{i.description || "—"}</td>
                <td>{i.unit}</td>
                <td className="n">{i.qty}</td>
                <td className="r">{money(i.price, p.currency)}</td>
                <td className="r">{money(lineTotal(i), p.currency)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><th colSpan={5} className="r">Subtotal :</th><td className="r">{money(t.subtotal, p.currency)}</td></tr>
            {p.includeVat ? <tr><th colSpan={5} className="r">VAT {p.vatRate}% :</th><td className="r">{money(t.vat, p.currency)}</td></tr> : null}
            <tr className="pf-grand"><th colSpan={5} className="r">Total :</th><td className="r">{money(t.grand, p.currency)}</td></tr>
          </tfoot>
        </table>
      </section>

      <section className="pf-terms">
        <p><strong>Delivery date :</strong> {p.delivery || "—"}</p>
        <p><strong>Terms of payment :</strong> {p.payment || "—"}</p>
        <p><strong>Validity:</strong> {p.validity || "—"}</p>
        {issuer.bank || issuer.account ? (
          <p><strong>Bank:</strong> {[issuer.bank, issuer.account].filter(Boolean).join(" · ")}</p>
        ) : null}
      </section>

      {p.notes ? (
        <section className="pf-notes">
          <p><strong>Notes:</strong> {p.notes}</p>
        </section>
      ) : null}

      <div className="pf-sign"><strong>Signature &amp; Stamp:</strong></div>

      <footer className="pf-foot">
        <p>{[issuer.address, issuer.phone ? `Phone No ${issuer.phone}` : ""].filter(Boolean).join(" , ")}</p>
      </footer>
    </article>
  );
});
