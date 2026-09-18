export const quoteResults = ["sent", "details", "limit", "unavailable"] as const;
export type QuoteResult = typeof quoteResults[number];

export function quoteResultMessage(result: string | null) {
  if (result === "sent") return "Thanks — your request is saved. Our team will contact you using the details you provided.";
  if (result === "limit") return "Too many requests were sent from this connection. Please call or try again in one hour.";
  if (result === "details" || result === "unavailable") return "We couldn’t save your request. Check the details, then try again or call us.";
  return "";
}
