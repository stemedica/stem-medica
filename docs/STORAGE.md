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
