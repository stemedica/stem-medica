# Whole-site UI/UX audit

Date: 2026-09-17
Status: Finding 1 fixed and verified locally. Other findings remain open.

## Summary

The site has a good responsive foundation, but the admin needs a usability pass. One data-loss bug was reproduced: browser Back can discard unsaved post edits without warning.

This was an audit, not an implementation pass. No application UI, CMS content, or existing admin credentials were changed. The temporary audit test was removed, its disposable database was cleaned up, and the normal local development server was restarted.

## Recommended implementation order

1. Prevent unsaved-edit loss through browser history navigation — completed locally.
2. Clarify the scope of Save/Publish actions.
3. Simplify mobile catalogue, post, and proforma workflows.
4. Improve quotation-request fallbacks and account-recovery guidance.
5. Unify visual styling and address accessibility details.

## Findings

### 1. High priority — browser Back loses unsaved work

Implementation follow-up:

- Added a root-level history guard shared by Posts, Catalogue, and Proformas through `useUnsavedChanges`.
- Back/Forward restores the current editor before displaying the existing Leave without saving modal. Cancel/Escape retains edits; Leave page replays the requested traversal.
- No duplicate history entries or browser-stored form data are created. Native reload/tab-close/cross-document warnings remain browser-controlled.
- Added `tests/history-navigation.spec.ts` and included it in the default isolated browser suite. See the final verification note below for results.

Verification: all five history regression tests passed in isolated Chromium, along with the authentication browser test, 11 unit-test files, TypeScript checking, ESLint, and diff whitespace checks. Coverage includes all three editors, Cancel/Escape and focus restoration, confirmed departure, Forward, multi-entry traversal, repeated Back, native hash entries, cancelled reload, and leaving after saving. Mobile and desktop confirmation screenshots were visually checked. No real CMS data or admin credentials were changed. Real-device Safari/back-gesture testing remains a follow-up; this is not a claim of full cross-browser certification.

Original audit evidence:

Confirmed reproduction:

1. Open Updates & blog from the admin Overview using the navigation link.
2. Add a post and edit its title without saving.
3. Use browser Back, then Forward.
4. No custom confirmation or native browser warning appears. On return, the unsaved post is gone.

The shared unsaved-change guard handles link clicks, sign-out, and full-page unloads, but not same-document browser history navigation. The post workflow was reproduced directly; catalogue and proformas use the same guard and need regression coverage too.

Suggested outcome: protect browser Back/Forward and mobile back gestures, or preserve recoverable unsaved editor state. Verify cancellation and continuation without creating navigation loops.

Source: `src/components/ConfirmationModal.tsx`, `useUnsavedChanges` around line 64.

### 2. High-priority workflow gap — quotation requests rely on an email app

The quotation form builds a `mailto:` URL; it does not submit a request to the website. Its wording correctly explains the handoff, but a customer without a configured mail application must switch to another contact flow.

Suggested outcome: offer Copy request and a WhatsApp handoff that preserve entered details. Actual server submission with delivery feedback is another option, but requires a separate implementation decision and verified email configuration. Do not claim a request was sent merely because an email app was opened.

Source: `src/app/test/(site)/quote/QuoteForm.tsx`, `onSubmit` around line 28.

### 3. High-priority usability issue — save scope is broader than the selected item

Catalogue and Posts save all pending collection edits, while labels such as Save draft, Save changes, and Publish post look item-specific. Explanatory text exists, but the scope can still surprise an admin or make an unrelated incomplete item block saving.

Suggested outcome: item-level saving, or clearly labelled Save all changes with a review of affected items. Preserve intentional draft/publication status and existing concurrency protection.

Sources: `src/app/test/admin/posts/PostsEditor.tsx` around lines 137–144; `src/app/test/admin/catalogue/CatalogueEditor.tsx` around lines 168–174.

### 4. Medium priority — mobile editors start too far down the page

On mobile, users pass the navigation, instructions, filters, and item list before reaching the editor. Lists stack above the editor and can introduce nested scrolling. Catalogue has publication filters but no product/category search.

Suggested outcome: separate list and edit views on narrow screens, a clear Back to products/posts action, focus movement into a newly selected editor, and catalogue search. Keep desktop split-pane editing where useful.

Sources: `src/app/test/admin/catalogue/CatalogueEditor.tsx` around lines 177–185; `src/app/test/admin/posts/PostsEditor.tsx` around lines 145–159.

### 5. Medium priority — proforma workflow is scroll-heavy

The mobile preview appears after the entire form and displays an A4 page requiring horizontal scrolling. The fixed save bar measured approximately 147px high in the initial mobile state. Notes, Payment, and Delivery are single-line inputs, and export-required fields are not clearly marked in advance.

Suggested outcome:

- Edit/Preview switching on mobile, with an optional fit-to-width preview.
- A compact primary action bar, with secondary actions elsewhere.
- Multiline fields for terms and notes, with corresponding document rendering.
- Clear distinction between fields required for a draft and fields required for export.
- Keep pricing manual and preserve seven-day draft-expiry semantics.

Sources: `src/app/test/admin/Builder.tsx` around lines 179, 270–299; `src/app/test/admin/styles.tsx`.

### 6. Medium priority — important CMS controls are hidden

Product category, description, and photo are under Additional details (optional). Blog cover images, galleries, and post type are also under that disclosure. Optional does not necessarily mean secondary to the editing task.

Suggested outcome: visible, clearly named Content, Media, and Categorisation sections. Keep genuinely infrequent metadata collapsed. Add a small formatting toolbar to the Markdown-based blog body editor without removing safe rendering or preview.

Sources: `src/app/test/admin/catalogue/CatalogueEditor.tsx` around line 194; `src/app/test/admin/posts/PostsEditor.tsx` around lines 163–168.

### 7. Medium priority — sign-in and recovery need polish

Login email/password inputs computed to 14px in the browser. Password visibility controls are absent. The forgotten-password instruction says to contact the site owner but does not give an actionable recovery route, which is especially awkward if the owner is locked out.

Suggested outcome: 16px form inputs, accessible Show/Hide password controls, and a verified recovery procedure with clear contact or recovery steps. Keep the minimum password length at 10 and authenticator setup optional, as previously requested.

Sources: `src/app/test/auth/login/LoginForm.tsx` around lines 30–32; first-login and authenticator setup forms.

### 8. Medium priority — visual styles vary between public pages

Homepage and blog use rounded, softer layouts. Quote, contact, and product-detail screens retain more angular panels, uppercase headings, and stronger red actions. The contrast between these styles makes the journey less cohesive.

Suggested outcome: standardise heading hierarchy, spacing, field shapes, button geometry, and primary-action colours around the established homepage direction. Preserve readable content and avoid a decorative redesign that slows the site.

Sources: `src/components/HomeHero.tsx`, `src/components/Section.tsx`, `src/app/globals.css`, and public route components.

### 9. Medium/low priority — accessibility details remain

- The proforma page has no `main` landmark; browser inspection confirmed this.
- Footer labels are small and subdued. Review contrast and font size; colour-token calculations indicated roughly 3.69:1 for 45%-opacity footer text and 4.22:1 for 50%-opacity labels against the navy background. These were source-based calculations, not a complete automated contrast audit.
- Keep validation next to fields, retain actionable error summaries, and reserve confirmation modals for decisions.
- Recheck focused controls around fixed/sticky action bars, including real mobile keyboards. Full-page screenshots containing fixed bars do not by themselves prove inaccessible overlap.

Sources: `src/app/test/admin/proformas/page.tsx`, `src/components/SiteFooter.tsx`, `src/components/AdminSaveBar.tsx`, `src/components/FormProblems.tsx`.

Reference guidance:

- [W3C form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [W3C focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- [W3C minimum target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

## What checked out

- No page-level horizontal overflow on checked public routes at 390px and 1440px.
- No page-level horizontal overflow on checked admin routes at 320px, 390px, 768px, and 1440px. The intentionally scrollable A4 preview is a separate usability issue.
- Blog covers and gallery media loaded; initially blank image areas in early screenshots were not established as broken images.
- Proformas remain prominent on the admin Overview.
- Inline admin validation, draft/publication labels, and confirmation dialogs provide a useful foundation.
- Isolated authentication tests passed, including optional authenticator setup and recovery-code sign-in.

## Coverage and limitations

Public route inspection covered the homepage, catalogue, a category filter, product detail, blog listing, article, About, Service, Contact, Quote, sign-in, and an unavailable route.

Authenticated inspection covered Overview, Catalogue, Posts, Proformas, and the enabled-authenticator screen using disposable test data. Source review also covered first-login/setup, validation, confirmations, media, and manual LinkedIn sharing.

This was local Chromium inspection and source review, not real-device Safari testing, a production performance benchmark, email-delivery verification, or full WCAG certification. Not every loading, network-failure, keyboard, and content-volume permutation was exercised. Existing labelled test entries and placeholder imagery remain intentional test content, not genuine inventory or shipment claims.

## Resume checklist

- Read this audit and check the current worktree before editing; preserve existing changes.
- Read the applicable design-engineer skill and installed Next.js documentation before implementation.
- Start with a regression test for browser Back/Forward losing an unsaved post.
- Agree on item-level versus collection-wide saving before making that workflow change.
- Verify mobile editing with both sparse and long lists, validation errors, and an on-screen keyboard.
- Use isolated test data for mutations; do not change production content or reset the existing admin account.
- Re-run relevant tests and inspect mobile/desktop screenshots after each focused improvement pass.
