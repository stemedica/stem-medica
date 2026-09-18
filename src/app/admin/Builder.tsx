"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useConfirmation, useUnsavedChanges } from "@/components/ConfirmationModal";
import { draftSchema } from "@/lib/cms-schema";
import { Plus, Trash2, Printer, FileDown, RotateCcw } from "lucide-react";
import { ProformaDoc } from "./ProformaDoc";
import { CataloguePicker } from "./CataloguePicker";
import { useFieldValidation } from "@/components/useFieldValidation";
import { useAdminFeedback } from "@/components/useAdminFeedback";
import { AdminSaveBar } from "@/components/AdminSaveBar";
import { formProblems, type FormProblem, UserFacingError, userError } from "@/lib/form-errors";
import { FormProblems, FieldProblem, fieldProblemProps, focusProblem } from "@/components/FormProblems";
import {
  addCatalogueProduct, blankItem, nextNumber, today,
  type Issuer, type Proforma,
} from "./proforma";

const DEFAULT_ISSUER: Issuer = {
  name: "STEM MEDICA",
  address: "Addis Ababa, Ethiopia",
  tin: "",
  vatReg: "",
  phone: "0921 136 180",
  email: "info@stemedicaet.com",
  bank: "",
  account: "",
};

const DEFAULT_DOC = (): Proforma => ({
  number: nextNumber(),
  date: today(),
  validity: "",
  currency: "ETB",
  includeVat: true,
  vatRate: 15,
  client: { name: "", attn: "", address: "", tin: "" },
  items: [blankItem()],
  notes: "",
  delivery: "",
  payment: "",
});

export function Builder() {
  const [attempted, setAttempted] = useState(false);
  const [exportAttempted, setExportAttempted] = useState(false);
  const { confirm, confirmationModal } = useConfirmation();
  const [issuer, setIssuer] = useState<Issuer>(DEFAULT_ISSUER);
  const [doc, setDoc] = useState<Proforma>(DEFAULT_DOC);
  const [draftId, setDraftId] = useState(() => crypto.randomUUID());
  const [etag, setEtag] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState("");
  const { message, tone, setMessage } = useAdminFeedback("");
  const [busy, setBusy] = useState(false);
  const [savedState, setSavedState] = useState(() => JSON.stringify({ issuer, doc }));
  const [drafts, setDrafts] = useState<{ id: string; number: string; client: string; expiresAt: string; etag: string }[]>([]);
  const previewIssuer = useDeferredValue(issuer);
  const previewDoc = useDeferredValue(doc);
  const serializedDraft = useMemo(() => JSON.stringify({ issuer, doc }), [issuer, doc]);
  const dirty = serializedDraft !== savedState;
  const validation = useMemo(() => draftSchema.safeParse({ issuer, doc }), [issuer, doc]);
  const saveProblems = !validation.success ? formProblems(validation.error.issues, "draft") : [];
  const exportProblems: FormProblem[] = [];
  {
    if (!issuer.name.trim()) exportProblems.push({ path: "issuer.name", label: "Issuer · Company", message: "Enter your company name before exporting." });
    if (!doc.client.name.trim()) exportProblems.push({ path: "doc.client.name", label: "Client · Name", message: "Enter the client’s name before exporting." });
    if (!doc.number.trim()) exportProblems.push({ path: "doc.number", label: "Document number", message: "Enter a document number before exporting." });
    doc.items.forEach((item, index) => { if (!item.description.trim()) exportProblems.push({ path: `doc.items.${index}.description`, label: `Item ${index + 1} · Description`, message: "Describe this item before exporting." }); });
  }
  const allProblems = [...saveProblems, ...exportProblems];
  const submitProblems = exportAttempted ? allProblems : saveProblems;
  const { problems, onBlurCapture, resetFields } = useFieldValidation(allProblems, attempted, submitProblems);
  useUnsavedChanges(dirty, confirm);

  async function listDrafts() {
    setBusy(true);
    try { const r = await fetch("/admin/api/drafts", { cache: "no-store" }); const b = await r.json(); if (!r.ok) throw new UserFacingError(b.error); setDrafts(b.drafts); setMessage(b.drafts.length ? "Choose a draft to reopen." : "No active drafts."); }
    catch (e) { setMessage(userError(e, "Unable to load drafts"), "error"); }
    finally { setBusy(false); }
  }
  async function saveDraft() {
    if (busy) return;
    const parsed = draftSchema.safeParse({ issuer, doc });
    setAttempted(true); setExportAttempted(false);
    if (!parsed.success) { setMessage(""); requestAnimationFrame(() => focusProblem(formProblems(parsed.error.issues, "draft")[0].path)); return; }
    setBusy(true); setMessage("Saving draft…");
    try {
      const r = await fetch("/admin/api/drafts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: draftId, etag, draft: parsed.data }) });
      const b = await r.json(); if (!r.ok) throw new UserFacingError(b.error);
      setEtag(b.etag); setExpiresAt(b.draft.expiresAt); setSavedState(JSON.stringify({ issuer, doc }));
      setDrafts((items) => [{ id: draftId, number: doc.number, client: doc.client.name, expiresAt: b.draft.expiresAt, etag: b.etag }, ...items.filter((item) => item.id !== draftId)]);
      setMessage(`Draft saved until ${new Date(b.draft.expiresAt).toLocaleString()}.`, "success");
    } catch (e) { setMessage(userError(e, "Save failed; your edits are still here."), "error"); }
    finally { setBusy(false); }
  }
  async function openDraft(id: string) {
    if (dirty && !await confirm({ title: "Open saved draft?", message: "Replace the current form with this saved draft? Unsaved edits will be lost.", action: "Open draft" })) return;
    setBusy(true);
    try {
      const r = await fetch(`/admin/api/drafts?id=${id}`, { cache: "no-store" }); const b = await r.json(); if (!r.ok) throw new UserFacingError(b.error);
      resetFields(); setAttempted(false); setExportAttempted(false); setIssuer(b.draft.issuer); setDoc(b.draft.doc); setDraftId(b.draft.id); setEtag(b.etag); setExpiresAt(b.draft.expiresAt);
      setSavedState(JSON.stringify({ issuer: b.draft.issuer, doc: b.draft.doc })); setMessage("Draft opened. You can edit it or export a PDF.");
    } catch (e) { setMessage(userError(e, "Unable to open draft"), "error"); }
    finally { setBusy(false); }
  }
  async function deleteDraft(id: string, revision: string | null, number: string) {
    if (busy || !revision || !await confirm({ title: "Remove saved draft?", message: `Permanently remove ${number || "this draft"}? Download a PDF first if you need a copy. The form currently on screen will not be cleared.`, action: "Remove draft" })) return;
    setBusy(true);
    try {
      const r = await fetch("/admin/api/drafts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, etag: revision }) });
      const b = await r.json(); if (!r.ok) throw new UserFacingError(b.error);
      if (id === draftId) { setEtag(null); setDraftId(crypto.randomUUID()); setExpiresAt(""); setSavedState(""); }
      setDrafts((items) => items.filter((d) => d.id !== id)); setMessage("Saved draft removed. The current form is unchanged.", "success");
    } catch (e) { setMessage(userError(e, "Unable to delete draft"), "error"); }
    finally { setBusy(false); }
  }
  function readyToExport() {
    setAttempted(true); setExportAttempted(true);
    const parsed = draftSchema.safeParse({ issuer, doc });
    if (!parsed.success || !doc.client.name.trim() || !issuer.name.trim() || !doc.number.trim() || doc.items.some((i) => !i.description.trim())) {
      setMessage("");
      requestAnimationFrame(() => focusProblem(allProblems[0]?.path ?? "")); return false;
    }
    return true;
  }

  const setItem = (id: string, patch: Partial<(typeof doc.items)[number]>) =>
    setDoc((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));

  /** Word opens HTML with this MIME type, so a real .docx writer is not needed. */
  async function downloadDoc() {
    if (!readyToExport()) return;
    const node = document.getElementById("proforma-doc");
    const styles = document.getElementById("proforma-styles");
    if (!node) return;
    setBusy(true);
    try {
    const copy = node.cloneNode(true) as HTMLElement;
    for (const image of copy.querySelectorAll("img")) {
      const response = await fetch(image.src);
      if (!response.ok) throw new Error("Unable to load a document image");
      const blob = await response.blob();
      image.src = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Unable to embed a document image"));
        reader.readAsDataURL(blob);
      });
    }
    const html =
      `<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
      `xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">` +
      `<head><meta charset="utf-8"><title>Proforma Invoice</title>` +
      `<style>${styles?.textContent ?? ""}</style></head>` +
      `<body>${copy.outerHTML}</body></html>`;
    const blob = new Blob(["﻿", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.number.replace(/\//g, "-")}.doc`;
    a.click(); setMessage("Document download started. Check your browser’s downloads.");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setMessage(userError(e, "Document export failed"), "error"); }
    finally { setBusy(false); }
  }

  function issueNumber() {
    setDoc((d) => ({ ...d, number: nextNumber() }));
  }

  async function reset() {
    if (dirty && !await confirm({ title: "Start a new proforma?", message: "Your unsaved edits will be lost.", action: "Start new proforma" })) return;
    resetFields(); setAttempted(false); setExportAttempted(false);
    const next = DEFAULT_DOC();
    setDoc(next); setDraftId(crypto.randomUUID()); setEtag(null); setExpiresAt(""); setSavedState(JSON.stringify({ issuer, doc: next })); setMessage("New proforma started.");
  }

  return (
    <div onBlurCapture={onBlurCapture} className="grid gap-6 xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)] xl:items-start">
      {confirmationModal}
      <AdminSaveBar label="Save as draft" onSave={saveDraft} disabled={!!etag && !dirty} busy={busy} dirty={dirty} tone={tone} cleanLabel={etag ? "No unsaved changes" : "New draft · not saved yet"} message={message || "Save your draft to reopen it on another device. Prices are entered manually."}>
        <button type="button" disabled={busy} onClick={() => { if (readyToExport()) window.print(); }} className="btn-outline min-h-11"><Printer size={14} aria-hidden="true" /> Print / PDF</button>
      </AdminSaveBar>
      {/* ---------------- Controls ---------------- */}
      <fieldset disabled={busy} className="no-print min-w-0 space-y-5 disabled:opacity-70">
        <FormProblems problems={attempted ? submitProblems : []} onSelect={(problem) => focusProblem(problem.path)} />
        <Group title="Temporary drafts" note="Saved privately for seven days from creation. Saving edits does not extend expiry.">
          <div className="action-stack gap-2"><button type="button" className="btn-outline min-h-11" onClick={listDrafts}>Open saved drafts</button>{etag ? <button type="button" className="btn-ghost min-h-11" onClick={() => deleteDraft(draftId, etag, doc.number)}>Remove current draft</button> : null}</div>
          {expiresAt ? <p className="text-xs text-steel">Expires {new Date(expiresAt).toLocaleString()}{dirty ? " · Unsaved edits" : ""}</p> : null}
          {drafts.map((d) => <div key={d.id} className="rounded-lg border border-hair p-3 text-sm" data-draft-id={d.id}>
            <p className="break-words font-medium">{d.number} · {d.client || "Unnamed client"}</p>
            <p className="mt-1 text-xs text-steel">Expires {new Date(d.expiresAt).toLocaleDateString()}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="btn-outline min-h-11" aria-label={`Open ${d.number || "draft"}`} onClick={() => openDraft(d.id)}>Open</button>
              <button type="button" className="btn-ghost min-h-11" aria-label={`Remove ${d.number || "draft"}`} onClick={() => deleteDraft(d.id, d.etag, d.number)}>Remove</button>
            </div>
          </div>)}
        </Group>
        <Group title="Issuer" note="Included in each saved draft.">
          <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["name", "Company"], ["address", "Address"], ["tin", "TIN"],
              ["vatReg", "VAT reg. no."], ["phone", "Phone"], ["email", "Email"],
              ["bank", "Bank"], ["account", "Account no."],
            ] as const
          ).map(([k, label]) => (
            <Field path={`issuer.${k}`} problems={problems} key={k} label={label} value={issuer[k]}
                   onChange={(v) => setIssuer((s) => ({ ...s, [k]: v }))} />
          ))}
          </div>
        </Group>

        <Group title="Document">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field path="doc.number" problems={problems} label="Number" value={doc.number} onChange={(v) => setDoc((d) => ({ ...d, number: v }))} />
            <Field path="doc.date" problems={problems} label="Date" type="date" value={doc.date} onChange={(v) => setDoc((d) => ({ ...d, date: v }))} />
            <Field path="doc.validity" problems={problems} label="Valid until" type="date" value={doc.validity} onChange={(v) => setDoc((d) => ({ ...d, validity: v }))} />
            <Field path="doc.currency" problems={problems} label="Currency" value={doc.currency} onChange={(v) => setDoc((d) => ({ ...d, currency: v }))} />
            <div className="sm:col-span-2 flex min-h-14 items-center justify-between gap-4 border border-hair px-3 py-2.5">
              <div>
                <div className="label text-steel">Include VAT</div>
                <p className="mt-1 text-xs text-steel">Show VAT separately and include it in the invoice total.</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span aria-hidden="true" className="min-w-6 text-right text-xs font-medium text-ink-soft">
                  {doc.includeVat ? "On" : "Off"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-label="Include VAT"
                  aria-checked={doc.includeVat}
                  onClick={() => setDoc((d) => ({ ...d, includeVat: !d.includeVat }))}
                  className="relative inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  <span aria-hidden="true" className={`relative block h-7 w-12 rounded-full border p-[3px] transition-colors ${doc.includeVat ? "border-navy bg-navy" : "border-hair bg-paper"}`}>
                    <span className={`block h-5 w-5 rounded-full border border-black/10 bg-white shadow-sm transition-transform ${doc.includeVat ? "translate-x-[22px]" : "translate-x-0"}`} />
                  </span>
                </button>
              </div>
            </div>
            {doc.includeVat ? (
              <Field path="doc.vatRate" problems={problems} label="VAT %" type="number" value={String(doc.vatRate)}
                     onChange={(v) => setDoc((d) => ({ ...d, vatRate: Number(v) || 0 }))} />
            ) : <p className="self-center text-xs text-steel">VAT is excluded. The saved rate remains {doc.vatRate}% if you turn it back on.</p>}
          </div>
          <button type="button" onClick={issueNumber} className="btn-ghost mt-1">
            Generate new reference
          </button>
        </Group>

        <Group title="Client">
          <Field path="doc.client.name" problems={problems} label="Name" value={doc.client.name} onChange={(v) => setDoc((d) => ({ ...d, client: { ...d.client, name: v } }))} />
          <Field path="doc.client.attn" problems={problems} label="Attn" value={doc.client.attn} onChange={(v) => setDoc((d) => ({ ...d, client: { ...d.client, attn: v } }))} />
          <Field path="doc.client.address" problems={problems} label="Address" value={doc.client.address} onChange={(v) => setDoc((d) => ({ ...d, client: { ...d.client, address: v } }))} />
          <Field path="doc.client.tin" problems={problems} label="TIN" value={doc.client.tin} onChange={(v) => setDoc((d) => ({ ...d, client: { ...d.client, tin: v } }))} />
        </Group>

        <Group title="Items">
          <CataloguePicker
            limitReached={doc.items.length >= 100}
            selectedItems={doc.items}
            onAdd={(product) => {
              resetFields(); setAttempted(false); setExportAttempted(false);
              setDoc((current) => addCatalogueProduct(current, product));
            }}
          />
          <div className="space-y-3">
            {doc.items.map((i, n) => (
              <div key={i.id} className="border border-hair p-3">
                <div className="flex items-center justify-between">
                  <span className="label text-steel">Item {n + 1}</span>
                  <button type="button" aria-label={`Remove item ${n + 1}`}
                          disabled={doc.items.length === 1}
                          onClick={() => { resetFields(); setAttempted(false); setExportAttempted(false); setDoc((d) => ({ ...d, items: d.items.filter((x) => x.id !== i.id) })); }}
                          className="flex min-h-11 min-w-11 items-center justify-center text-steel transition-colors hover:text-vital disabled:opacity-40">
                    <Trash2 size={14} />
                  </button>
                </div>
                <Field path={`doc.items.${n}.description`} problems={problems} label="Description" value={i.description} onChange={(v) => setItem(i.id, { description: v })} />
                <div className="grid grid-cols-3 gap-3">
                  <Field path={`doc.items.${n}.qty`} problems={problems} label="Qty" type="number" value={String(i.qty)} onChange={(v) => setItem(i.id, { qty: Number(v) || 0 })} />
                  <Field path={`doc.items.${n}.unit`} problems={problems} label="Unit" value={i.unit} onChange={(v) => setItem(i.id, { unit: v })} />
                  <Field path={`doc.items.${n}.price`} problems={problems} label="Price" type="number" value={String(i.price)} onChange={(v) => setItem(i.id, { price: Number(v) || 0 })} />
                </div>
              </div>
            ))}
          </div>
          <button type="button" disabled={doc.items.length >= 100} onClick={() => { resetFields(); setAttempted(false); setExportAttempted(false); setDoc((d) => d.items.length >= 100 ? d : ({ ...d, items: [...d.items, blankItem()] })); }}
                  className="btn-ghost mt-3">
            <Plus size={14} /> Add item
          </button>
        </Group>

        <Group title="Terms">
          <Field path="doc.delivery" problems={problems} label="Delivery" value={doc.delivery} onChange={(v) => setDoc((d) => ({ ...d, delivery: v }))} />
          <Field path="doc.payment" problems={problems} label="Payment" value={doc.payment} onChange={(v) => setDoc((d) => ({ ...d, payment: v }))} />
          <Field path="doc.notes" problems={problems} label="Notes" value={doc.notes} onChange={(v) => setDoc((d) => ({ ...d, notes: v }))} />
        </Group>

        <div className="action-stack gap-2.5 border-t border-hair pt-6">
          <button type="button" onClick={downloadDoc} className="btn-outline">
            <FileDown size={14} /> Download .doc
          </button>
          <button type="button" onClick={reset} className="btn-ghost">
            <RotateCcw size={14} /> New proforma
          </button>
        </div>
        <p className="text-xs leading-relaxed text-steel">
          Print / PDF uses the browser&apos;s own print dialogue: choose &ldquo;Save as
          PDF&rdquo;. The .doc file opens in Word, LibreOffice and Google Docs, where it
          can be saved as .docx. Saved drafts are private and expire after seven days;
          downloaded files remain on your device.
        </p>
      </fieldset>

      {/* ---------------- Preview ---------------- */}
      <section className="min-w-0" aria-label="Proforma preview">
        <div className="no-print mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-navy">Document preview</h2>
          <p id="preview-help" className="text-xs text-steel">A4 layout · Scroll sideways on smaller screens</p>
        </div>
      <div className="pf-stage" tabIndex={0} role="region" aria-label="Scrollable A4 document" aria-describedby="preview-help" aria-busy={previewIssuer !== issuer || previewDoc !== doc}>
        <ProformaDoc issuer={previewIssuer} p={previewDoc} />
      </div>
      </section>
    </div>
  );
}

function Group({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-hair bg-white p-4 sm:p-5">
      <h2 className="font-display text-base font-semibold text-navy">{title}</h2>
      {note ? <p className="mt-2 text-xs text-steel">{note}</p> : null}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label, value, onChange, type = "text", path = "", problems = [],
}: { label: string; value: string; onChange: (v: string) => void; type?: string; path?: string; problems?: FormProblem[] }) {
  return (
    <label className="block">
      <span className="label text-steel">{label}</span>
      <input
        {...fieldProblemProps(problems, path)}
        type={type}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 min-w-0 w-full rounded-[2px] border border-hair bg-white px-3 py-2 text-base outline-none transition-colors focus:border-navy"
      />
      <FieldProblem problems={problems} path={path} />
    </label>
  );
}
