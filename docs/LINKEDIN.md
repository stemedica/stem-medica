# LinkedIn company-page publishing

Status: manual admin sharing tools implemented; automatic API publishing is not connected. Target confirmed by the owner: https://www.linkedin.com/company/stem-medica/. No LinkedIn posts have been sent by this implementation.

## Available now

In Admin → Posts, select a saved, published article and expand Share to LinkedIn. Edit temporary LinkedIn copy independently of the article, copy the text/link, and download the cover or gallery images. Open the company page, switch to its admin view, and create/review the post in LinkedIn. Local and preview builds disable the external posting link. On production, the admin must confirm the article is publicly available and the company-page destination is correct before the link is enabled.

This flow does not post automatically, attach images automatically, track successful shares, or synchronize edits/deletions. Existing LinkedIn posts must be managed on LinkedIn, subject to LinkedIn's editing options. The temporary text resets when changing posts or save/publication state and is not persisted. The panel does not load LinkedIn scripts or send data to LinkedIn until the admin follows the external link.

Choose images before publication: [LinkedIn allows text edits](https://www.linkedin.com/help/linkedin/answer/a522811/editing-a-shared-post?lang=en), but [uploaded photos cannot be edited after posting](https://www.linkedin.com/help/linkedin/answer/a527229/sharing-photos-or-videos?lang=en).

## Access needed

Create a LinkedIn developer application associated with the STEM MEDICA page and have its super admin verify it. Apply for Community Management API access: this is a vetted product, with Development and Standard tiers; approval is not guaranteed. Request only the permissions required for the implemented workflow. Company publishing uses `w_organization_social` and an authorized page admin, not just the self-service personal-profile sharing product.

Sources: [Community Management overview and access](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview?view=li-lms-2026-04), [application verification](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-api-migration-guide?view=li-lms-2026-07), [Posts API permissions](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-03).

## Proposed implementation (not yet built)

- Add an admin-only OAuth “Connect LinkedIn” flow, with state/CSRF protection and an exact HTTPS callback URL. Never request the user's LinkedIn password.
- Store client secrets only in server-side Vercel environment variables; encrypt OAuth tokens in private durable storage. Track expiry and show reconnect status. Refresh tokens are not available to every app, so handle reauthorization explicitly. [LinkedIn token lifecycle](https://learn.microsoft.com/en-us/linkedin/shared/authentication/programmatic-refresh-tokens).
- Let the admin opt in to automatic sharing. On first publication, queue the title, summary, public article URL and optional cover for the company feed. This is a feed post linking to the website, not a mirrored LinkedIn long-form article.
- Use the current versioned REST Posts API with the verified organization URN. Image uploads require a LinkedIn image asset; the API does not simply reuse a website image as an uploaded asset. Confirm the supported API version during implementation. [Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-03).
- Website publication must succeed independently. A durable job tracks pending/sent/failed, retries, and the returned LinkedIn post ID. Deduplicate ordinary edits and repeated publish requests. Reconcile ambiguous timeouts before resending; do not promise exactly-once delivery across two services.
- Because CMS content and a job queue may live in different stores, include reconciliation for a saved post whose queue write failed. Do not rely on an unawaited request inside a Vercel function.
- Show sharing status and a manual retry in the CMS. Unpublishing or deleting a website article must not silently delete a LinkedIn post.

## Before implementation

Confirm the exact company-page URL and page-admin access, then obtain API approval. Configure the deployed HTTPS callback and server secrets privately in Vercel. Test against an explicitly approved test post before enabling automatic publication. Existing articles must not be bulk-shared automatically.

The website now provides canonical article URLs and article Open Graph metadata (including a cover when supplied). These help public link previews once the website is deployed; they do not authorize automatic publishing.
