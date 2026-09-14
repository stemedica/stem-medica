/** Shapes and helpers for the proforma builder. Kept out of the component so
 *  the document export and the on-screen preview cannot drift apart. */

export type LineItem = {
  id: string;
  description: string;
  qty: number;
  unit: string;
  price: number;
};

export type Issuer = {
  name: string;
  address: string;
  tin: string;
  vatReg: string;
  phone: string;
  email: string;
  bank: string;
  account: string;
};

export type Proforma = {
  number: string;
  date: string;
  validity: string;
  currency: string;
  vatRate: number;
  client: { name: string; attn: string; address: string; tin: string };
  items: LineItem[];
  notes: string;
  delivery: string;
  payment: string;
};

export const money = (n: number, currency: string) =>
  `${currency} ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const lineTotal = (i: LineItem) => i.qty * i.price;

export function totals(p: Proforma) {
  const subtotal = p.items.reduce((s, i) => s + lineTotal(i), 0);
  const vat = subtotal * (p.vatRate / 100);
  return { subtotal, vat, grand: subtotal + vat };
}

/** Sequential numbering, per browser. See docs/ADMIN.md for the limitation. */
const SEQ_KEY = "stem:proforma:seq";

export function nextNumber(): string {
  const year = new Date().getFullYear();
  let seq = 1;
  try {
    const raw = localStorage.getItem(SEQ_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    seq = parsed && parsed.year === year ? parsed.seq + 1 : 1;
    localStorage.setItem(SEQ_KEY, JSON.stringify({ year, seq }));
  } catch {
    /* private window or storage disabled: fall back to 1 */
  }
  return `SM/PI/${year}/${String(seq).padStart(4, "0")}`;
}

export function peekNumber(): string {
  const year = new Date().getFullYear();
  try {
    const raw = localStorage.getItem(SEQ_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const seq = parsed && parsed.year === year ? parsed.seq : 0;
    return `SM/PI/${year}/${String(seq + 1).padStart(4, "0")}`;
  } catch {
    return `SM/PI/${year}/0001`;
  }
}

export const today = () => new Date().toISOString().slice(0, 10);

export const blankItem = (): LineItem => ({
  id: Math.random().toString(36).slice(2, 9),
  description: "",
  qty: 1,
  unit: "pcs",
  price: 0,
});
