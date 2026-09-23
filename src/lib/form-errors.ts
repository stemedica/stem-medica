import type { ZodIssue } from "zod";

export type FormProblem = { path: string; label: string; message: string };
const labels: Record<string, string> = {
  arrivalNoticeUntil: "Highlight until", arrivalNoticeEnabled: "Arrival notice",
  slug: "Website address", name: "Name", brand: "Brand", origin: "Country of origin", model: "Model", manufacturer: "Manufacturer", summary: "Description", category: "Category", short: "Short name", blurb: "Description", image: "Image", leadTime: "Lead time", title: "Title", author: "Author", excerpt: "Summary", body: "Body", date: "Date", kind: "Post type", published: "Publication setting", featured: "Featured setting", label: "Specification label", value: "Specification value", services: "Included services", specs: "Specifications", currency: "Currency", vatRate: "VAT rate", qty: "Quantity", price: "Price", description: "Description", number: "Document number", validity: "Price validity", unit: "Unit", email: "Email", address: "Address", tin: "TIN", vatReg: "VAT registration", phone: "Phone", bank: "Bank", account: "Account number", attn: "Contact person", notes: "Notes", delivery: "Delivery", payment: "Payment", items: "Items", products: "Products", categories: "Categories", posts: "Posts",
};
function friendly(issue: ZodIssue, field: string) {
  if (issue.code === "custom") {
    if (field === "arrivalNoticeUntil") return "Choose an expiry on or after the display date.";
    if (field === "id") return "This item appears twice. Remove the extra copy and add it again if needed.";
    if (issue.message.startsWith("Duplicate")) return "This website address is already used. Choose a different one.";
    if (field === "category") return "Choose an existing category.";
    if (field === "validity") return "Choose a date on or after the document date.";
    if (field === "excerpt") return "Add a summary before publishing.";
    if (field === "body") return "Add the article text before publishing.";
    return "Please check this value before saving.";
  }
  if (issue.code === "too_small") {
    if (issue.origin === "number") return `Enter a number ${issue.inclusive ? "of at least" : "greater than"} ${issue.minimum}.`;
    if (issue.origin === "array") return `Add at least ${issue.minimum} item${Number(issue.minimum) === 1 ? "" : "s"}.`;
    return "Please complete this field.";
  }
  if (issue.code === "too_big") {
    if (issue.origin === "number") return `Enter a number no greater than ${issue.maximum}.`;
    if (issue.origin === "array") return `Keep this list to ${issue.maximum} items or fewer.`;
    return `Use ${issue.maximum} characters or fewer.`;
  }
  if (field === "slug") return "Use lowercase letters, numbers and hyphens only (for example, patient-monitor).";
  if (field === "category") return "Choose a category for this product.";
  if (field === "image") return "Upload a JPEG, PNG or WebP image using the image picker.";
  if (["date", "validity", "arrivalNoticeUntil"].includes(field)) return "Choose a valid date.";
  if (["qty", "price", "vatRate"].includes(field)) return "Enter a valid number.";
  if (field === "email") return "Enter a valid email address.";
  return "Choose or enter a valid value.";
}

export function formProblems(issues: readonly ZodIssue[], scope?: "catalogue" | "posts" | "draft"): FormProblem[] {
  return issues.map((issue) => {
    const path = issue.path.map(String).filter((part, i) => !(i === 0 && ["catalogue", "draft"].includes(part)));
    if (path[0] === "posts") path.shift();
    const last = path.at(-1) ?? "";
    const field = /^\d+$/.test(last) ? path.at(-2) ?? "" : last;
    let prefix = "";
    if (["products", "categories"].includes(path[0]) && /^\d+$/.test(path[1])) prefix = `${path[0] === "products" ? "Product" : "Category"} ${Number(path[1]) + 1} · `;
    else if ((scope === "posts" || typeof issue.path[0] === "number" || issue.path[0] === "posts") && /^\d+$/.test(path[0])) prefix = `Post ${Number(path[0]) + 1} · `;
    else if (path[0] === "issuer") prefix = "Issuer · ";
    else if (path.includes("client")) prefix = "Client · ";
    const item = path.indexOf("items"), spec = path.indexOf("specs");
    if (item >= 0 && path[item + 1]) prefix += `Item ${Number(path[item + 1]) + 1} · `;
    if (spec >= 0 && path[spec + 1]) prefix += `Specification ${Number(path[spec + 1]) + 1} · `;
    return { path: path.join("."), label: prefix + (labels[field] ?? "Details"), message: friendly(issue, field) };
  });
}

/** Only explicitly user-facing failures may be displayed; transport/parser details stay private. */
export class UserFacingError extends Error {}
export function userError(error: unknown, fallback = "We couldn’t complete that action. Your edits are still here. Please try again.") {
  return error instanceof UserFacingError && error.message.trim() ? error.message : fallback;
}
