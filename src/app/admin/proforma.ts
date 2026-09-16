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

const amountFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export const money = (n: number, currency: string) => `${currency} ${amountFormat.format(n)}`;

export const lineTotal = (i: LineItem) => i.qty * i.price;

export function totals(p: Proforma) {
  const subtotal = p.items.reduce((s, i) => s + lineTotal(i), 0);
  const vat = subtotal * (p.vatRate / 100);
  return { subtotal, vat, grand: subtotal + vat };
}

/** Unique references without a database counter. These are not sequential invoice numbers. */
export function nextNumber(): string {
  return `SM/PI/${new Date().getFullYear()}/${crypto.randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`;
}

export const today = () => new Date().toISOString().slice(0, 10);

export const blankItem = (): LineItem => ({
  id: crypto.randomUUID(),
  description: "",
  qty: 1,
  unit: "pcs",
  price: 0,
});
