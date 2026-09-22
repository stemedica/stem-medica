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
  position:relative; width:210mm; min-height:297mm; box-sizing:border-box; margin:0 auto; padding:11mm 12mm 20mm;
  background:#fff; color:#050505; font-family:"Times New Roman", Times, serif;
  font-size:11.5pt; line-height:1.28; box-shadow:0 8px 30px rgba(15,37,85,.18);
}
.pf-head { min-height:28mm; }
.pf-brand { display:flex; align-items:center; width:max-content; max-width:100%; color:#f10c12; }
.pf-logo { display:block; flex:0 0 auto; width:36mm; height:auto; }
.pf-brand span { margin-left:-1mm; border-bottom:1.1mm solid #f10c12; font-size:29pt; line-height:.96; white-space:nowrap; }
.pf-document-title { margin:3mm 0 5mm; text-align:center; font-size:17pt; line-height:1.1; text-transform:uppercase; }
.pf-meta { display:flex; flex-direction:column; align-items:flex-end; gap:5mm; margin:0 7mm 10mm 0; }
.pf-meta div { display:flex; align-items:baseline; gap:1.5mm; min-width:69mm; }
.pf-meta dt { font-weight:bold; }
.pf-meta dd { margin:0; }
.pf-parties { margin:0 13mm; }
.pf-from { display:flex; flex-direction:column; }
.pf-party-label { margin:0 0 6mm; text-transform:uppercase; }
.pf-from strong { text-transform:uppercase; }
.pf-to { display:flex; flex-direction:column; margin-top:6mm; }
.pf-table-block { position:relative; z-index:0; margin-top:5mm; }
.pf-table-block h2 { margin:0 0 4mm; text-align:center; font-size:14pt; line-height:1.2; }
.pf-watermark { position:absolute; z-index:-1; top:10mm; left:50%; width:112mm; height:auto; transform:translateX(-50%); opacity:.15; }
.pf-items { width:100%; border-collapse:collapse; table-layout:fixed; font-size:10.5pt; }
.pf-items th, .pf-items td { border:1px solid #111; padding:1.7mm 2mm; vertical-align:top; overflow-wrap:anywhere; }
.pf-items thead th { text-align:center; font-weight:normal; }
.pf-items thead th:nth-child(1) { width:7%; }
.pf-items thead th:nth-child(2) { width:35%; }
.pf-items thead th:nth-child(3) { width:10%; }
.pf-items thead th:nth-child(4) { width:9%; }
.pf-items thead th:nth-child(5) { width:17%; }
.pf-items thead th:nth-child(6) { width:22%; }
.pf-items tbody td { min-height:12mm; }
.pf-items .n { text-align:center; }
.pf-items .r { text-align:right; }
.pf-items tbody .r { white-space:normal; }
.pf-items tfoot th { text-align:right; font-weight:normal; }
.pf-items tfoot .pf-grand th, .pf-items tfoot .pf-grand td { font-weight:bold; }
.pf-terms { margin:6mm 13mm 0; }
.pf-terms p, .pf-notes p { margin:0 0 5mm; }
.pf-terms strong, .pf-notes strong { margin-right:1.5mm; }
.pf-notes { margin:0 13mm; }
.pf-sign { margin:4mm 13mm 0; }
.pf-foot { position:absolute; right:17mm; bottom:8mm; left:17mm; border-top:1.5px solid #111; padding-top:8mm; }
.pf-foot p { margin:0; color:#22558a; text-align:center; font-weight:bold; font-size:13pt; }

@media print {
  @page { size:A4; margin:0; }
  html, body { background:#fff !important; padding-bottom:0 !important; }
  .proforma-shell { background:#fff !important; min-height:0 !important; }
  .no-print, header.no-print { display:none !important; }
  .proforma-workspace { padding:0 !important; max-width:none !important; }
  [aria-label="Proforma preview"] { grid-column:1 / -1; }
  .pf-stage { padding:0; background:#fff; overflow:visible; border:0; border-radius:0; }
  .pf { box-shadow:none; margin:0; width:auto; min-height:auto; }
  .pf-foot { position:fixed; }
  .pf-items { page-break-inside:auto; }
  .pf-items tr { page-break-inside:avoid; break-inside:avoid; }
  .pf-terms, .pf-notes, .pf-sign { page-break-inside:avoid; break-inside:avoid; }
}
` }} />
  );
}
