# How content is stored

Products, categories and blog posts are **single JSON documents**, not rows.

```
content_document
  key        text  PK    "catalogue/current.json", "posts/current.json", "drafts/<id>.json"
  data       jsonb       the entire collection
  revision   text        rotated per write; the optimistic-concurrency token
  updated_at timestamptz
```

Enquiries are the exception: one row per submission in `enquiry`, because they
arrive from the public and need rate limiting and per-record status.

Images live in Vercel Blob, served through `/media/[id]`. Auth uses the
`auth_*` tables.

## Why documents

- Reordering, moving a product between categories, or deleting a category and
  reassigning its products are all single writes. Relationally each is a
  multi-statement transaction.
- Cross-entity rules ("a product cannot reference a category that does not
  exist", "slugs are unique") are one Zod pass over the whole document.
- One read serves a page that needs products *and* categories.
- `storage.ts` has three interchangeable drivers: `local` (filesystem),
  `blob` (Vercel Blob) and `postgres`. The document model is what makes them
  interchangeable. Per-row storage would be Postgres-only.

## The limit, and why it is in bytes

Per-field caps multiply out far past what this model can carry, so the real
invariant is enforced in `storage.ts` at the single write path:

```
CONTENT_DOCUMENT_MAX_BYTES = 1_000_000
```

A write over that is rejected with HTTP 413 and a message telling the editor to
shorten entries. Schema caps (300 products, 60 posts, and the per-field limits
in `cms-schema.ts` / `post-schema.ts`) keep a realistic collection far below it;
the byte guard catches the cases arithmetic cannot.

**Raising that constant is a decision to move a collection to per-row storage,
not a number to nudge.**

## When to move to per-row storage

Migrate a collection when any of these is true:

1. Its document passes ~500 KB.
2. More than two people edit concurrently. Today a second editor's save is
   rejected, not merged.
3. You need real queries: filtering, pagination or search in SQL. All of that
   currently happens in memory after loading the whole document, including blog
   search, which scans every post body.
4. You need per-record history: who changed this product, and when.

**Posts should move first.** They grow without bound, are edited individually,
and `getPost()` loads every post to find one. A `post` table with a GIN index
would fix search properly.

**The catalogue should move last.** Products and categories are tightly
cross-referenced and genuinely edited as a unit, which is what documents are
good at, and the collection is bounded by what a distributor actually stocks.

Moving either one means posts or products become Postgres-only; the `local` and
`blob` drivers cannot serve rows. Budget for `post-store.ts`, the admin API
route, five seed scripts and the end-to-end suite.

## Image uploads

Images for products, categories, posts and post galleries all share one store:
`media/<uuid>.webp` in Vercel Blob. Only the JSON documents live in Postgres.

Uploads are shrunk twice, for different reasons:

1. **In the browser** (`lib/client-image.ts`), before anything is sent. Vercel
   rejects request bodies over ~4.5 MB with `FUNCTION_PAYLOAD_TOO_LARGE` before
   the function runs, so a 10 MB photo can only work if it is downscaled first.
   This also saves the editor's upload bandwidth, which matters on mobile data.

   Three decode paths are tried in order, because each fails differently:
   `createImageBitmap` capped during decode (so a 48 MP photo never
   materialises at full size, which is what saves a cheap Android phone),
   then `createImageBitmap` with no options, then an `<img>` via an object URL
   for engines that lack it entirely. If the result is still too big it steps
   down through 1280, 1024 and 800px before giving up with a message naming
   what to do.

   If every path fails and the file cannot physically reach the server, the
   editor is told to save it as a JPEG rather than being shown a platform error.
2. **On the server** (`lib/image-processing.ts`), with sharp. This is the actual
   validation, since a client can send anything: 1600px long edge, WebP q78,
   EXIF stripped, and a 40 MP decode ceiling so a small but highly compressed
   file cannot exhaust function memory.

The admin may choose a file up to 10 MB. What crosses the wire is whatever the
browser produced, capped at `UPLOAD_BODY_LIMIT` (4 MB) to stay under the
platform limit.

### If images ever outgrow this

The escape hatch is Vercel Blob **client uploads**: the browser uploads straight
to Blob with a signed token, bypassing the function body limit entirely, and the
server processes the result on a completion callback. That is the right answer
for large files such as video, and the wrong answer here: it costs a token
route, a publicly reachable completion webhook (awkward on localhost), and
leaves the untouched original in Blob to be re-processed and cleaned up. Not
worth it for 10 MB photographs that compress to a few hundred KB in the browser.

`/media/[id]` serves with `max-age=31536000, immutable`, which is safe because
filenames are UUIDs and content never changes under one.
