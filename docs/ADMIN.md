# Admin workspace

The current `/admin` home is a mobile-first overview with proformas as its primary action, real CMS counts, and catalogue/blog shortcuts. The builder lives at `/admin/proformas`; pricing, saved drafts and document exports are unchanged. The four primary navigation links stay visible on small screens, with Security and Sign out in the footer.

Catalogue, blog and proforma editors share a save bar: bottom-pinned on phones, top-sticky on larger screens. Use the save button or Ctrl/Cmd+S. Saving is explicit, not automatic; saving CMS changes applies their publication settings. Errors leave local edits intact. Proforma Print/PDF is available beside Save draft and does not save the temporary draft automatically.

Validation starts when you leave a field, then updates as you correct it. Untouched fields remain quiet until saving or exporting is attempted. A “Fields to check” summary identifies the product, post or proforma item; selecting an issue opens that item and focuses the field. New items and reloaded records reset their validation state. Partial proforma drafts can still be saved; export-only requirements are explained separately. Server validation still runs independently and returns friendly messages instead of raw schema errors.

Save failures stay visible next to the save action and preserve edits. Success confirmations disappear when editing resumes. Saving shows progress and blocks duplicate submissions. Sign out checks for unsaved edits before ending the session; cancelling keeps both the session and form intact. Unexpected admin rendering failures have a friendly retry screen. Browser-controlled reload/tab-close warnings remain native because browsers cannot wait for a custom modal during unload.

For the current email/password + authenticator implementation, local first-login setup and production activation checklist, see [Admin authentication](AUTH.md). The historical Basic-auth description below is no longer implemented.

> Superseded implementation notes: see [CMS and temporary drafts](CMS.md).
> Drafts now use private Blob JSON with seven-day expiry, and references are
> generated without localStorage. The older notes below describe the original MVP.

Historical MVP notes below; use the current routes and authentication guide above.

## Can this run on Vercel's free tier?

Mostly, with one real caveat and one licensing problem.

| Need | Hobby (free) | Notes |
| --- | --- | --- |
| `admin.stemedicaet.com` subdomain | **Yes** | Custom domains are included on Hobby. |
| Platform password protection | **No** | Vercel's Deployment Protection password is a Pro feature (~$20/mo). |
| App-level auth | **Yes** | Which is why the gate lives in `src/proxy.ts`. |
| Proxy (middleware) | **Yes** | Included on Hobby. |
| PDF / document export | **Yes** | Entirely client-side, no server cost. |

**The licensing problem:** Vercel's Hobby plan is for non-commercial use. This is a
commercial company website, so strictly it belongs on Pro. That is a business
decision, not a technical blocker, but it should be a conscious one: Pro also
brings the platform password protection that would make the app-level gate below
unnecessary.

## How the gate works

`src/proxy.ts` (Next 16 renamed `middleware.ts` to `proxy.ts`) does two things:

1. Rewrites requests arriving on an `admin.*` host to `/admin`, so the subdomain
   shows the builder and nothing else.
2. Requires HTTP Basic auth for anything under `/admin`, on any hostname.

It **fails closed**: with no credentials configured the admin is unreachable
rather than open.

```bash
# .env.local, and Vercel → Settings → Environment Variables
ADMIN_USER=...
ADMIN_PASSWORD=...
```

**What this is and isn't.** Basic auth over HTTPS keeps the page out of public
hands and out of search engines. It is a shared password, not a user system:
there are no accounts, no audit trail, and no per-person revocation. Rotate it by
changing the env var and redeploying. If the admin ever holds anything sensitive,
replace this with real auth.

## Setting up the subdomain

1. Vercel → Project → Settings → Domains → add `admin.stemedicaet.com`.
2. Add the CNAME Vercel gives you at your DNS provider.
3. Nothing else: `proxy.ts` already routes that hostname.

Until the domain exists, reach it at `/admin` on the main URL.

## Creating a proforma

Fill the left column, watch the A4 page on the right, then:

- **Print / PDF** opens the browser print dialogue. Choose "Save as PDF". The
  print stylesheet drops the interface and prints the document alone at A4.
- **Download .doc** produces a Word-compatible HTML file. It opens in Word,
  LibreOffice and Google Docs, where it can be saved as `.docx`.

Both run in the browser. Nothing is uploaded, and no PDF or DOCX library is
bundled, which is what keeps the page light.

> If a true OOXML `.docx` is ever required rather than a Word-readable `.doc`,
> that needs a zip writer (`docx`, ~500KB). Deliberately not included.

## Known limitations

- **The proforma counter is per browser.** `SM/PI/<year>/<seq>` increments in
  `localStorage`, so two people on two machines will both issue `0001`. Fine for
  one person on one machine; anything more needs a database counter. This is the
  first thing to fix if the tool gets real use.
- **Drafts are per browser** for the same reason. Issuer details persist, so they
  only need entering once.
- **The template is a reasonable default, not STEM MEDICA's.** Fields are there
  for TIN, VAT registration, bank details, validity and delivery/payment terms,
  but the real template, the correct VAT treatment and the required legal wording
  need to come from Geremew before this issues anything to a client.
- **Currency is a free-text field.** Equipment is imported, so quoting ETB
  against a USD cost needs a stated rate and date on the document. Add that to
  the notes until the template says otherwise.
