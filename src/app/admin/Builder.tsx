"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Printer, FileDown, RotateCcw } from "lucide-react";
import { ProformaDoc } from "./ProformaDoc";
import {
  blankItem, nextNumber, peekNumber, today,
  type Issuer, type Proforma,
} from "./proforma";

const ISSUER_KEY = "stem:proforma:issuer";
const DRAFT_KEY = "stem:proforma:draft";

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
  number: peekNumber(),
  date: today(),
  validity: "",
  currency: "ETB",
  vatRate: 15,
  client: { name: "", attn: "", address: "", tin: "" },
  items: [blankItem()],
  notes: "",
  delivery: "",
  payment: "",
});

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function Builder() {
  // This component never prerenders (see BuilderClient), so storage can be read
  // straight into the initial state rather than patched in after mount.
  const [issuer, setIssuer] = useState<Issuer>(() => load(ISSUER_KEY, DEFAULT_ISSUER));
  const [doc, setDoc] = useState<Proforma>(() => load(DRAFT_KEY, DEFAULT_DOC()));

  // Writing to storage is a genuine external-system sync, which is what effects
  // are for.
  useEffect(() => {
    try {
      localStorage.setItem(ISSUER_KEY, JSON.stringify(issuer));
      localStorage.setItem(DRAFT_KEY, JSON.stringify(doc));
    } catch { /* storage unavailable */ }
  }, [issuer, doc]);

  const setItem = (id: string, patch: Partial<(typeof doc.items)[number]>) =>
    setDoc((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));

  /** Word opens HTML with this MIME type, so a real .docx writer is not needed. */
  function downloadDoc() {
    const node = document.getElementById("proforma-doc");
    const styles = document.getElementById("proforma-styles");
    if (!node) return;
    const html =
      `<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
      `xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">` +
      `<head><meta charset="utf-8"><title>${doc.number}</title>` +
      `<style>${styles?.textContent ?? ""}</style></head>` +
      `<body>${node.outerHTML}</body></html>`;
    const blob = new Blob(["﻿", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.number.replace(/\//g, "-")}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function issueNumber() {
    setDoc((d) => ({ ...d, number: nextNumber() }));
  }

  function reset() {
    setDoc({ ...DEFAULT_DOC(), number: peekNumber() });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
      {/* ---------------- Controls ---------------- */}
      <div className="no-print space-y-7">
        <Group title="Issuer" note="Saved in this browser and reused on every proforma.">
          {(
            [
              ["name", "Company"], ["address", "Address"], ["tin", "TIN"],
              ["vatReg", "VAT reg. no."], ["phone", "Phone"], ["email", "Email"],
              ["bank", "Bank"], ["account", "Account no."],
            ] as const
          ).map(([k, label]) => (
            <Field key={k} label={label} value={issuer[k]}
                   onChange={(v) => setIssuer((s) => ({ ...s, [k]: v }))} />
          ))}
        </Group>

        <Group title="Document">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Number" value={doc.number} onChange={(v) => setDoc((d) => ({ ...d, number: v }))} />
            <Field label="Date" type="date" value={doc.date} onChange={(v) => setDoc((d) => ({ ...d, date: v }))} />
            <Field label="Valid until" type="date" value={doc.validity} onChange={(v) => setDoc((d) => ({ ...d, validity: v }))} />
            <Field label="Currency" value={doc.currency} onChange={(v) => setDoc((d) => ({ ...d, currency: v }))} />
            <Field label="VAT %" type="number" value={String(doc.vatRate)}
                   onChange={(v) => setDoc((d) => ({ ...d, vatRate: Number(v) || 0 }))} />
          </div>
          <button type="button" onClick={issueNumber} className="btn-ghost mt-1">
            Assign next number
          </button>
        </Group>

        <Group title="Client">
          <Field label="Name" value={doc.client.name} onChange={(v) => setDoc((d) => ({ ...d, client: { ...d.client, name: v } }))} />
          <Field label="Attn" value={doc.client.attn} onChange={(v) => setDoc((d) => ({ ...d, client: { ...d.client, attn: v } }))} />
          <Field label="Address" value={doc.client.address} onChange={(v) => setDoc((d) => ({ ...d, client: { ...d.client, address: v } }))} />
          <Field label="TIN" value={doc.client.tin} onChange={(v) => setDoc((d) => ({ ...d, client: { ...d.client, tin: v } }))} />
        </Group>

        <Group title="Items">
          <div className="space-y-3">
            {doc.items.map((i, n) => (
              <div key={i.id} className="border border-hair p-3">
                <div className="flex items-center justify-between">
                  <span className="label text-steel">Item {n + 1}</span>
                  <button type="button" aria-label={`Remove item ${n + 1}`}
                          onClick={() => setDoc((d) => ({ ...d, items: d.items.filter((x) => x.id !== i.id) }))}
                          className="text-steel transition-colors hover:text-vital">
                    <Trash2 size={14} />
                  </button>
                </div>
                <Field label="Description" value={i.description} onChange={(v) => setItem(i.id, { description: v })} />
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Qty" type="number" value={String(i.qty)} onChange={(v) => setItem(i.id, { qty: Number(v) || 0 })} />
                  <Field label="Unit" value={i.unit} onChange={(v) => setItem(i.id, { unit: v })} />
                  <Field label="Price" type="number" value={String(i.price)} onChange={(v) => setItem(i.id, { price: Number(v) || 0 })} />
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setDoc((d) => ({ ...d, items: [...d.items, blankItem()] }))}
                  className="btn-ghost mt-3">
            <Plus size={14} /> Add item
          </button>
        </Group>

        <Group title="Terms">
          <Field label="Delivery" value={doc.delivery} onChange={(v) => setDoc((d) => ({ ...d, delivery: v }))} />
          <Field label="Payment" value={doc.payment} onChange={(v) => setDoc((d) => ({ ...d, payment: v }))} />
          <Field label="Notes" value={doc.notes} onChange={(v) => setDoc((d) => ({ ...d, notes: v }))} />
        </Group>

        <div className="flex flex-wrap gap-2.5 border-t border-hair pt-6">
          <button type="button" onClick={() => window.print()} className="btn-primary">
            <Printer size={14} /> Print / PDF
          </button>
          <button type="button" onClick={downloadDoc} className="btn-outline">
            <FileDown size={14} /> Download .doc
          </button>
          <button type="button" onClick={reset} className="btn-ghost">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
        <p className="text-xs leading-relaxed text-steel">
          Print / PDF uses the browser&apos;s own print dialogue: choose &ldquo;Save as
          PDF&rdquo;. The .doc file opens in Word, LibreOffice and Google Docs, where it
          can be saved as .docx. Nothing leaves this browser.
        </p>
      </div>

      {/* ---------------- Preview ---------------- */}
      <div className="pf-stage">
        <ProformaDoc issuer={issuer} p={doc} />
      </div>
    </div>
  );
}

function Group({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="label border-b-2 border-ink pb-2 text-ink">{title}</h2>
      {note ? <p className="mt-2 text-xs text-steel">{note}</p> : null}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="label text-steel">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-[2px] border border-hair bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-navy"
      />
    </label>
  );
}
