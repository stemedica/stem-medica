# Larger CMS test dataset

Run only against the configured `test/cms-preview` Neon branch:

```sh
npx tsx scripts/seed-scale-preview.ts --confirm-test-branch
npx tsx scripts/seed-scale-preview.ts --confirm-test-branch --apply
```

The first command is read-only. The second adds entries to reach **100 products, 10 categories and 60 posts in total**, including existing entries. Each category has ten products. Existing published/draft status, images, gallery, text and arrival settings are preserved.

Additional products are labelled generic procurement scenarios, not real manufacturer models or inventory. Additional posts are labelled procurement articles, not clinical advice or actual shipment announcements. Five existing optimized illustrative images are reused without uploading duplicate files.

Both content documents update atomically with revision checks. Previous documents are retained under `catalogue-history/scale-backup-<revision>.json` and `posts/scale-backup-<revision>.json`. Reruns at target counts do nothing. Unexpected categories or counts above the targets stop the script without deleting content.

Expected public pagination (when all records are published): six homepage equipment cards per selection, six homepage posts, ten product pages and six blog pages, ten entries per page. Publication filters can reduce the public counts.

This seed does not modify authentication, admin accounts, proformas, database schema or production content.
