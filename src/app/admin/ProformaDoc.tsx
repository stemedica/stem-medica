import { money, lineTotal, totals, type Issuer, type Proforma } from "./proforma";

/**
 * The document itself. One component renders both the on-screen preview and the
 * printed/exported page, so what you see is exactly what is issued.
 */
export function ProformaDoc({ issuer, p }: { issuer: Issuer; p: Proforma }) {
  const t = totals(p);

  return (
    <article id="proforma-doc" className="pf">
      <header className="pf-head">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="pf-logo" />
          <div className="pf-issuer">
            <strong>{issuer.name}</strong>
            <span>{issuer.address}</span>
            <span>TIN {issuer.tin} · VAT {issuer.vatReg}</span>
            <span>{issuer.phone} · {issuer.email}</span>
          </div>
        </div>
        <div className="pf-title">
          <h1>Proforma Invoice</h1>
          <table className="pf-meta">
            <tbody>
              <tr><th>No.</th><td>{p.number}</td></tr>
              <tr><th>Date</th><td>{p.date}</td></tr>
              <tr><th>Valid until</th><td>{p.validity}</td></tr>
            </tbody>
          </table>
        </div>
      </header>

      <section className="pf-to">
        <div className="pf-label">Bill to</div>
        <strong>{p.client.name || "—"}</strong>
        {p.client.attn ? <div>Attn: {p.client.attn}</div> : null}
        {p.client.address ? <div>{p.client.address}</div> : null}
        {p.client.tin ? <div>TIN {p.client.tin}</div> : null}
      </section>

      <table className="pf-items">
        <thead>
          <tr>
            <th className="n">#</th>
            <th>Description</th>
            <th className="n">Qty</th>
            <th>Unit</th>
            <th className="r">Unit price</th>
            <th className="r">Amount</th>
          </tr>
        </thead>
        <tbody>
          {p.items.map((i, n) => (
            <tr key={i.id}>
              <td className="n">{n + 1}</td>
              <td>{i.description || "—"}</td>
              <td className="n">{i.qty}</td>
              <td>{i.unit}</td>
              <td className="r">{money(i.price, p.currency)}</td>
              <td className="r">{money(lineTotal(i), p.currency)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><th colSpan={5} className="r">Subtotal</th><td className="r">{money(t.subtotal, p.currency)}</td></tr>
          <tr><th colSpan={5} className="r">VAT {p.vatRate}%</th><td className="r">{money(t.vat, p.currency)}</td></tr>
          <tr className="pf-grand"><th colSpan={5} className="r">Total</th><td className="r">{money(t.grand, p.currency)}</td></tr>
        </tfoot>
      </table>

      <section className="pf-terms">
        <div>
          <div className="pf-label">Delivery</div>
          <p>{p.delivery || "—"}</p>
          <div className="pf-label">Payment</div>
          <p>{p.payment || "—"}</p>
        </div>
        <div>
          <div className="pf-label">Bank</div>
          <p>{issuer.bank}<br />{issuer.account}</p>
        </div>
      </section>

      {p.notes ? (
        <section className="pf-notes">
          <div className="pf-label">Notes</div>
          <p>{p.notes}</p>
        </section>
      ) : null}

      <footer className="pf-foot">
        <div className="pf-sign">
          <span>Authorised signature</span>
        </div>
        <p className="pf-small">
          This is a proforma invoice, not a tax invoice. Prices are valid until the
          date shown and are subject to stock availability.
        </p>
      </footer>
    </article>
  );
}
