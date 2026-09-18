# Catalogue CMS and temporary proformas

CMS documents can use Neon PostgreSQL (`CONTENT_STORAGE_DRIVER=postgres`): catalogue, posts, catalogue history and seven-day proforma drafts are stored as JSONB in `content_document`. Images remain in private Vercel Blob (or local development media). There is no browser-storage dependency. Without this explicit setting, the legacy Blob/local document backend remains available. Admin authentication is separate; see [authentication setup](AUTH.md).

## Neon test migration

Test branch: `test/cms-preview` in project `floral-pond-53488161`. Production remains unchanged. Test connections are in the git-ignored `.env.neon-test`, separate from the local auth database.

- `npm run dev` starts the local website with CMS documents in Neon while retaining the existing local admin login. `npm run dev:local` explicitly uses the legacy local environment.
- `CMS_DATABASE_URL` overrides the CMS connection only; otherwise PostgreSQL mode uses `DATABASE_URL`. Use the pooled URL at runtime.
- Review `drizzle-content/`, then run `CONTENT_MIGRATION_CONFIRM=apply npm run content:migrate` with the direct `CMS_DATABASE_URL_UNPOOLED` injected to apply the separate CMS migrations.
- The guarded importer `scripts/import-test-content.ts` requires `--confirm-test-branch` and an exact `EXPECTED_TEST_DATABASE_HOST`. It validates local JSON, imports in one transaction, rejects different destination content and verifies reads and stale/concurrent-write protection. It does not delete source files.
- JSONB keeps each existing editor save atomic. Revision tokens reject stale updates and deletes. Public cache keys include the database connection identity without exposing credentials.
- Proforma expiry and the protected cleanup route are unchanged. A local-only test branch needs the cleanup route invoked by a running app; it has no independent scheduled job. Production scheduling still requires deployment and `CRON_SECRET`.

The setup below describes the legacy Blob backend and image storage; enabling Neon does not automatically migrate or change production.

Setup performed on 2026-09-16: private store `stem-medica-content` in `fra1` connected to the project's Production environment; `CRON_SECRET` configured as a secret. A real Blob smoke test verified private reads/writes, stale-write rejection and denied anonymous reads, then deleted its temporary test object. Application changes still require deployment for the CMS and cron route to become live.

## Connect production storage

1. In the Vercel project's Storage tab, create a **private** Blob store. Connect it to this project. Use separate stores for production and testing.
2. Configure the server-only `BLOB_READ_WRITE_TOKEN`, or the connected store's `BLOB_STORE_ID` and Vercel-managed OIDC credentials.
3. Configure [email/password authentication](AUTH.md). Admin APIs check sessions themselves and reject cross-origin mutations. Basic credentials are no longer accepted.
4. Set `CRON_SECRET` to a long random value. The daily job in `vercel.json` sends it as a bearer token.
5. Deploy and open `/admin/catalogue`. A new store starts empty: add your categories and products, then save. No sample entries are published automatically.

Do not put Blob credentials in `NEXT_PUBLIC_` variables. Vercel's Hobby plan is restricted to non-commercial use; this company website requires an appropriate commercial plan.

## Editing

- `/admin/catalogue`: products, categories, photos, specifications, services, publication and featured status.
- All categories are public after saving; only products marked Published appear publicly.
- Category links are generated from the name automatically; there is no slug field. Renaming a saved category preserves its link and product assignments. Categories with assigned products cannot be removed until those products are moved.
- The homepage displays CMS categories, featured published products and published posts only when present. Empty sections, demo catalogue fallbacks, mock media and lorem ipsum have been removed.
- Delete, discard, restore and in-app navigation confirmations use accessible modals. Browser-owned tab-close/reload warnings remain for unsaved changes; inline validation remains next to forms.
- Products require a name and brand; categories require a name. Other descriptive fields are optional and grouped under Additional details. An empty category short name uses its full name. Products without a category appear under All products.
- Product URLs are generated automatically before the first save and then remain stable when renamed. Possible duplicate product names and brands show a warning with an action to open the existing item.
- Products and posts have explicit Save draft, Publish and Unpublish actions, plus All/Published/Drafts filters. Unpublishing hides the item without deleting its content or changing its URL. CMS drafts have no seven-day expiry; that limit applies only to proformas.
- Blog drafts need a title; publishing also requires body text. A missing summary is generated from the body for public display. Date and author are prefilled and can be changed under Additional details.
- Saving preserves publication statuses. Publish/Unpublish changes the selected item's status. Each action saves all pending edits in that editor as one atomic JSON document. ETags reject stale saves from other tabs/editors.
- Images are limited to JPEG, PNG or WebP, up to 3 MB. Optimise before uploading.
- Uploaded images stay private until referenced by a public category or published product. The public media route serves only referenced images. Previously delivered public images may remain cached for up to one hour.
- The previous catalogue is archived before each update. Version history loads an earlier version for review; click Save catalogue to publish it. Daily cleanup retains the newest 30 backups.
- Public data uses a five-minute Next.js cache, explicitly invalidated on save. Storage reads bypass Blob's CDN cache so an old JSON file is not republished accidentally.
- Removing an image reference does not delete the image file, so older catalogue versions can still be restored. Storage usage therefore grows with uploads; audit unused images periodically.

## Seven-day drafts

`/admin` is the overview, with proformas as the primary action. The builder is at `/admin/proformas`. Save draft explicitly to store it; Open saved drafts lists active drafts across devices. Unsaved edits stay only in memory and closing the page loses them.

Each draft JSON contains an independent snapshot of issuer, client, items, prices and terms. It expires exactly seven days after initial creation. Editing does not extend the expiry. Requests for expired drafts return 410 before the scheduled job physically deletes them, normally within the next day. Monitor cron failures; they can delay physical deletion but do not extend API access.

Print / PDF opens the browser print dialog; choose Save as PDF. PDFs are generated from the loaded snapshot and are never stored on the server. Word-compatible `.doc` export remains available. Downloaded documents are unaffected by draft cleanup.

References are randomly generated unique identifiers, **not sequential invoice numbers**. The reference field remains editable for an existing company numbering process. Financial/legal template wording and VAT settings need company review before customer use.

## Local development and verification

Set `STORAGE_DRIVER=local` in `.env.development.local` for filesystem-backed development (configured in this workspace). `.local-storage/` is ignored by Git. This mode is disabled on Vercel; production never falls back to ephemeral disk or browser storage. Local edits do not publish to production.

Run `npm run dev` with the isolated Neon branch configured in `.env.neon-test`. Provision the development admin with the private command in [AUTH.md](AUTH.md). Never use production database credentials for local development or automated tests.

Run `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.

With Docker running and the normal dev server stopped, run the isolated browser suite:

```sh
npm run test:e2e:local
```

Use a newly created temporary directory for each test run. Install Chromium with `npx playwright install chromium` or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to an installed browser. Tests publish sample QA content, modify their own test draft to exercise expiry, and run cleanup, so never point them at production.

Admin sign-in requires a privately provisioned email/password account. See [AUTH.md](AUTH.md) for provisioning, password resets and launch checks.
# Catalogue-to-proforma workflow

## Homepage equipment discovery

The homepage shows **Explore our equipment** immediately after the hero. It uses published CMS products and CMS categories, with up to six products per selection. Products marked Featured appear first; remaining slots use other published products in catalogue order. Uncategorized products still appear under All equipment. Drafts never appear, and empty categories show an informational state without an enquiry action.

Product cards use the CMS name, brand, description and photo. Missing photos have a clearly labelled placeholder; upload real equipment images through Catalogue to replace them. Category filtering is instant after hydration; links retain ordinary catalogue URLs for opening in a new tab. The full catalogue remains available beyond the six-card preview. No product pricing or stock claims are generated by this section.

Known local limitation: with JavaScript disabled, the existing Next streamed loading boundary can leave public page content hidden. The no-JavaScript browser test is marked fixme pending a separate site-wide fallback pass; this section does not establish full no-JavaScript support.

## Updates & blog

Open `/admin/posts` to add, edit, preview, publish, unpublish or remove posts. Choose Blog, Upcoming arrival (expected equipment) or New arrival (already arrived). Legacy Order update records are read as Blog without deleting their content or changing their URLs. Active arrival notices use a blue accent and package badge on the homepage, blog index, related stories and article, with a short pulse that stops after 4.2 seconds and respects reduced motion.

Arrival notices default to **90 calendar days including the display date**, using Addis Ababa midnight boundaries. Under Additional details → Arrival notice, set an optional **Highlight until** date or disable the notice. Blank uses the 90-day default. Expiry must not precede the display date. The post stays published after expiry, labelled “Arrival update” without attention styling; it is never deleted or reclassified as a Blog. Older posts without these fields use the same defaults. The display date is not a publishing schedule, but the highlight starts on that date. Fresh page requests calculate current notice state independently of the cached post document; an already-open page updates on refresh.

Add a title, automatically generated stable URL, display date, author, summary, plain-text body and optional JPEG/PNG/WebP cover image (3 MB maximum). Paragraph breaks are preserved; HTML is displayed as text, not executed.

Under Additional details, Article gallery accepts up to eight extra JPEG/PNG/WebP images (3 MB each) in one selection. Edit descriptions and captions, move images earlier or remove them, then save. The cover remains on homepage/blog cards; gallery images appear after the article body in a two-column desktop grid and a swipeable mobile rail. Draft gallery images use the authenticated media endpoint; only images referenced by published content are publicly served. Removing a gallery entry unlinks it, but does not delete the underlying media file. Existing posts without a gallery remain compatible.

### Public browsing limits and mobile rails

- Homepage: at most six product previews per category and six latest posts, plus links to full listings.
- Product/category and blog listings: ten results per page; numbered pagination preserves search/type/category filters.
- Below 640px: product and blog lists, related cards and article galleries use native horizontal snapping, a next-card peek, swipe hint, position counter and labelled 44px arrow buttons. No autoplay or third-party carousel. Single-item lists omit controls. New filters/pages reset the rail.
- Tablet/desktop: regular grids. Mobile product details show the photo below the title, before description and enquiry information. Category headers show their CMS image.
- Card images remain lazy-loaded; listing card links disable speculative detail-page prefetch. Only current-page card markup is sent to the browser. CMS documents remain cached on the server; this is presentation pagination, not a new row-level database query architecture.

Changes are applied with **Save posts**. Published entries appear on the homepage and `/blog`, with filters by post type. The display date does not schedule publication. Drafts and their exclusive images are not exposed through public pages. Unpublishing removes the page, but previously downloaded/cached images cannot be recalled. Existing placeholder Markdown files are preserved on disk but no longer feed the website.

Posts persist as `posts/current.json` in the selected document backend (Neon JSONB or legacy private Blob), without browser storage. Concurrent saves are rejected instead of overwriting another editor. This first version supports 100 posts, each with up to 10,000 body characters. Posts do not expire; the seven-day expiry applies only to proforma drafts. Removal is permanent after saving; unpublish instead if you want to retain an article. There is no post revision history in this version.

In the proforma builder, use **Browse catalogue** to search published equipment by product, brand or category. Adding equipment copies its name and brand into the document; enter the agreed price manually. Later catalogue edits do not change saved proforma items. Manual items remain supported, with a maximum of 100 lines per document.
