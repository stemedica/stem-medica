/**
 * Document styles live in one <style> tag so the .doc export can inline exactly
 * the same rules the preview and the print output use. Plain CSS, not Tailwind,
 * because Word will not resolve utility classes or custom properties.
 */
export function ProformaStyles() {
  return (
    <style id="proforma-styles" dangerouslySetInnerHTML={{ __html: `
.pf-stage { min-width:0; background:#e6e9ee; padding:16px; overflow-x:auto; border:1px solid #c7cdd8; border-radius:12px; }
.pf-stage:focus-visible { outline:2px solid #1a3e8f; outline-offset:3px; }
@media screen and (min-width:1280px) {
  [aria-label="Proforma preview"] { position:sticky; top:12rem; }
  .pf-stage { max-height:calc(100dvh - 16rem); overflow:auto; }
}
.pf {
  width:210mm; min-height:297mm; box-sizing:border-box; margin:0 auto; padding:16mm 15mm;
  background:#fff; color:#111a2e; font-family:Arial, Helvetica, sans-serif;
  font-size:10.5pt; line-height:1.45; box-shadow:0 8px 30px rgba(15,37,85,.18);
}
.pf-head { display:flex; justify-content:space-between; gap:20mm; border-bottom:2px solid #1a3e8f; padding-bottom:6mm; }
.pf-logo { height:18mm; width:auto; display:block; margin-bottom:4mm; }
.pf-issuer { display:flex; flex-direction:column; font-size:9pt; line-height:1.55; }
.pf-issuer strong { font-size:12pt; color:#1a3e8f; }
.pf-title { text-align:right; }
.pf-title h1 { margin:0 0 4mm; font-size:19pt; letter-spacing:.06em; text-transform:uppercase; color:#1a3e8f; }
.pf-meta { margin-left:auto; border-collapse:collapse; font-size:9.5pt; }
.pf-meta th { text-align:left; padding:1mm 4mm 1mm 0; color:#6b7385; font-weight:normal; text-transform:uppercase; font-size:8pt; letter-spacing:.1em; }
.pf-meta td { text-align:right; padding:1mm 0; font-weight:bold; }
.pf-to { margin-top:7mm; }
.pf-label { font-size:8pt; letter-spacing:.14em; text-transform:uppercase; color:#6b7385; margin-bottom:1.5mm; }
.pf-items { width:100%; border-collapse:collapse; margin-top:7mm; font-size:9.5pt; }
.pf-items th, .pf-items td { border:1px solid #c7cdd8; padding:2.4mm 3mm; vertical-align:top; }
.pf-items thead th { background:#eff1f4; text-align:left; font-size:8pt; letter-spacing:.1em; text-transform:uppercase; color:#3c4761; }
.pf-items .n { text-align:center; width:12mm; }
.pf-items .r { text-align:right; white-space:nowrap; }
.pf-items tfoot th { text-align:right; background:#fff; font-weight:normal; }
.pf-items tfoot .pf-grand th, .pf-items tfoot .pf-grand td { background:#1a3e8f; color:#fff; font-weight:bold; font-size:11pt; }
.pf-terms { display:flex; gap:12mm; margin-top:7mm; font-size:9.5pt; }
.pf-terms > div { flex:1; }
.pf-terms p { margin:0 0 4mm; }
.pf-notes { margin-top:5mm; font-size:9.5pt; }
.pf-foot { margin-top:14mm; }
.pf-sign { border-top:1px solid #111a2e; width:65mm; padding-top:2mm; font-size:9pt; color:#3c4761; }
.pf-small { margin-top:6mm; font-size:8pt; color:#6b7385; }

@media print {
  @page { size:A4; margin:0; }
  html, body { background:#fff !important; padding-bottom:0 !important; }
  .proforma-shell { background:#fff !important; min-height:0 !important; }
  .no-print, header.no-print { display:none !important; }
  .proforma-workspace { padding:0 !important; max-width:none !important; }
  [aria-label="Proforma preview"] { grid-column:1 / -1; }
  .pf-stage { padding:0; background:#fff; overflow:visible; border:0; border-radius:0; }
  .pf { box-shadow:none; margin:0; width:auto; min-height:auto; }
  .pf-items { page-break-inside:auto; }
  .pf-items tr { page-break-inside:avoid; }
}
` }} />
  );
}
