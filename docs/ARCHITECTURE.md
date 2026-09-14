# Where the next pieces go

Nothing here is built. This is the shape the MVP was written to accept, so that
adding it later is additive rather than a rewrite.

---

## 1. Telegram — enquiry routing

**The case for it:** the sales team already lives on Telegram, and the site's
conversion today is a `tel:` link. A web form that emails `info@` will be checked
less often than a group chat that pings. Telegram turns the website into a lead
source the team actually notices.

**Recommended: outbound only, no bot framework.**

```
src/app/api/enquiry/route.ts   POST  → Telegram Bot API sendMessage
src/components/EnquiryForm.tsx       → product-scoped form, posts to the route
```

A Server Action or route handler does one `fetch` to
`https://api.telegram.org/bot<TOKEN>/sendMessage` with the enquiry formatted as a
message into a group the sales team is in. That is the whole integration — no
library, no webhook, no persistent connection, and it works on any host.

```
TELEGRAM_BOT_TOKEN=…
TELEGRAM_CHAT_ID=…        # the sales group, not a person
```

Notes:
- **Store the enquiry before sending it.** Telegram is the notification, not the
  record. If the API call fails the lead must not vanish.
- Rate-limit the route and add a honeypot field. A public endpoint that forwards
  to a staff chat is a spam target.
- Use `parse_mode: "HTML"` and escape user input — a device name with `<` in it
  will otherwise silently drop the message.

**Deliberately not recommended for v1:** an inbound bot (customers chatting with a
Telegram bot to browse the catalogue). It's a second product with its own content
model and support burden. Revisit once the website itself is producing leads.

---

## 2. Proforma invoice generation

**The case for it:** Ethiopian hospital procurement runs on proformas. Issuing
them same-day is a real competitive advantage, and it's currently manual work in
Word.

Three options, cheapest first:

### Option A — HTML proforma + browser print *(recommended for v1)*
A `/proforma/[id]` route with a print stylesheet, opened and saved as PDF by the
person issuing it. No dependency, no serverless binary, fully styled from the same
tokens, and trivially editable. Covers the real need at close to zero cost.

### Option B — `@react-pdf/renderer`
Server-side, real PDF bytes, ~1MB dependency. Worth it when proformas need to be
emailed automatically or attached to a Telegram message without a human in the
loop. Layout is a React-like DSL, not HTML/CSS — budget a day for the template.

### Option C — headless Chromium (Puppeteer / Playwright)
Pixel-identical to the HTML version. Heavy: needs a runtime that allows a Chromium
binary, which rules out most edge deploys and inflates cold starts. Only if A and
B both fail you.

Whichever you pick, the parts that matter are not the renderer:

- **Sequential proforma numbers** that survive a redeploy — a database counter, not
  a timestamp or a random ID. Finance will reconcile against these.
- **TIN, VAT treatment and validity period** on the document. Get these from
  Geremew before designing the template; they're a legal requirement, not styling.
- **Currency and FX basis.** Equipment is imported; quoting in ETB against a USD
  cost needs a stated rate and date on the document or it becomes a dispute.
- **Line items reference `Product.slug`,** so a proforma can be regenerated later
  from the catalogue rather than from free text.

---

## 3. What this implies for storage

Both features want a small database — enquiries, and the proforma counter plus
issued documents. The MVP has none on purpose.

When you need one, **Postgres** (Neon or Supabase) with Drizzle is the least
surprising choice here, and it also gives you somewhere to move the product
catalogue when `products.ts` outgrows hand-editing. Keep the `Product` type as the
contract: swap `src/content/products.ts` for a query returning the same shape and
no component changes.

---

## 4. Suggested build order

1. **Real product list** into `products.ts`. Everything else is theatre until the
   catalogue is true.
2. **Real installation photography** replacing the empty image slots.
3. **Telegram enquiry route** — smallest piece with the largest commercial effect.
4. **Amharic**, written by the team, via `next-intl` — the fonts and layout are
   already wired.
5. **Proforma, Option A.**
6. Database, when 3 and 5 have proven they're used.

---

## 5. Deployment

Vercel is the path of least resistance for Next.js. Two things specific to this
project:

- **Test on a real Ethiopian connection**, not throttled DevTools. The build is
  deliberately light (one variable font, SVG marks, no icon library, no carousel)
  but photography will undo that if it isn't compressed and served as WebP/AVIF.
- **Sort out `stemedicaet.com` first.** It doesn't currently resolve, and it's the
  domain printed on the company's own posts and business cards.
