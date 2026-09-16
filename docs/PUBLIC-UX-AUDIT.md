# Public website UX pass

## Findings addressed

- The image-free hero retained a photo-sized empty area and pushed actions below a phone’s first screen. It now fits the content and keeps the primary links early.
- Desktop navigation started at tablet width and wrapped its labels and phone number. The compact menu now stays available below 1024px, supports Escape/focus restoration and outside-click dismissal, and identifies the current page.
- Category links displayed the generic catalogue heading. They now show the saved category name/description, breadcrumbs and filtered totals. Missing and empty categories have distinct recovery paths.
- Product and blog lists had no pagination; the blog had no search. Search/filter state now survives numbered pagination in the URL (10 products or 10 posts per page; updated September 2026).
- Product detail pages lacked category context, forced wide specification tables and buried the enquiry action. Category return links, wrapping tables and an early quotation link address these issues.
- Longer articles now provide a collapsible contents list with unique section anchors. Headings respect the fixed navigation offset.
- Supporting pages lacked a primary heading and still contained lorem ipsum/demonstration copy. Each now has one h1, useful copy and a next action. The fake bilingual demo and unverified company-statistics panel were removed.
- Public forms use 16px input text to avoid small-input zoom on phones. Footer links have larger touch targets; the bottom contact bar respects the device safe area. A skip link and clearer focus styling support keyboard navigation.
- Unpublished/missing content and unexpected page failures now have branded recovery screens rather than raw or contextless errors.

## CMS scope

Products, categories and posts remain CMS-driven. The user chose to keep company/homepage wording outside CMS in this pass. Saving content through admin invalidates public content caches. No automated pricing or production deployment was added.

## Verification

`tests/public-ux.spec.ts` covers 320px, 390px, 768px and 1440px layouts; long product names; navigation; category/search/pagination state; article anchors; empty/missing categories; missing posts; and immediate reflection of a CMS category edit. It uses only the disposable test store. Existing CMS tests cover image publication and draft/publish/unpublish flows.

Real-device Safari/Android and assistive-technology checks remain part of pre-launch QA; Chromium emulation is not a substitute for them. Company copy/contact channels and supplier-approved product imagery still need owner review. The quote form prepares an email in the visitor’s mail app; it does not send email from the server.

See [local preview content](LOCAL-PREVIEW.md) for the labelled test records and manufacturer references.
