# Local preview content

## Current workspace: Neon test branch

The sample content has moved to `test/cms-preview` in Neon. Run `npm run dev` to use it; the separate git-ignored `.env.neon-test` supplies the CMS connection only. Local admin authentication remains unchanged. There are five labelled test categories (including the two renamed user entries), five products and three posts.

The previously empty categories now include a MELAG Vacuklav 31 B+ steam sterilizer and Olympus CX23 microscope. Manufacturer references: [MELAG Pro-Class](https://configurator.melag.com/sites/default/files/import/Pro-Class.pdf), [Olympus CX23](https://www.olympus-global.com/technology/design/product/cx23.html). The guarded `scripts/fill-test-categories.ts --confirm-test-branch` adds these without duplicating or overwriting existing entries, preserving the previous catalogue revision in Neon.

Previous local CMS documents and seed backups are archived under `.local-archive/cms-before-neon-2026-09-16/`, not used by the app. Local image uploads still use the development filesystem; production images remain configured for private Vercel Blob. No images existed in this migration.

The Neon test branch is persistent until intentionally removed; it does not share the proforma drafts' seven-day expiry. Production data/settings were not modified. This local preview has no automatic cron scheduler, so physical expired-draft cleanup requires invoking the protected cleanup endpoint or a future test deployment.

## Optional offline fixtures

Run `npx tsx scripts/seed-local-preview.ts --confirm-local` to add three labelled test categories, three products and three original sample posts to `.local-storage`. It refuses production/Vercel execution, never connects to Blob or the auth database, preserves existing records and backs up the previous documents under `.local-storage/local-preview-backups/`. Running again does not duplicate or overwrite matching entries.

Entries are published **locally** for visual testing and can be edited or unpublished in the normal admin CMS. All seeded addresses begin with `test-`. They are not imported automatically in production. Catalogue/post caches may take up to five minutes to refresh after script execution; saving through admin refreshes immediately.

The product names and short equipment-type descriptions reference manufacturers:

- [Mindray BeneVision N1](https://www.mindray.com/en/products/patient-monitoring/continuous-patient-monitoring/benevision-n1)
- [GE HealthCare MAC 5](https://www.gehealthcare.com/en-us/products/diagnostic-ecg/resting-ecg/mac-5-resting-ecg)
- [Dräger Savina 300 Select](https://www.draeger.com/en-us_us/Products/Savina-300-Select)

These examples do not claim stock, authorised distribution, regulatory clearance, delivery dates, prices or customer orders. Photos are intentionally omitted until approved product imagery is available. Test articles are original procurement-oriented copy, not medical guidance or real company announcements.

Before launch, review real product descriptions, approved photos, company copy and contact channels. Do not copy the test records into production. Unpublish local examples through admin when no longer needed; removing one and saving deletes it from the CMS document, while the seed backup remains available.
