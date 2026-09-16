# STEM MEDICA, website (MVP demo)

**Live:** https://stem-medica.vercel.app · **Repo:** private, `natinael96/stem-medica`

Pushes to `main` deploy to production automatically via the Vercel Git integration.

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript.

Brand direction and rationale: **[docs/brand-direction.html](docs/brand-direction.html)**, open it in a browser.

```bash
npm run local:setup  # Docker required; persistent local admin database
npm run dev     # http://127.0.0.1:3000/test (root shows maintenance)
npm run build   # production build
```

First admin visit: [http://localhost:3000/test/auth/login](http://localhost:3000/test/auth/login). Create your password privately (10 characters minimum). Authenticator setup is optional under Security. There is no browser password popup. See [admin setup](docs/AUTH.md); local setup does not change production.

## What's in the MVP

| Route | Notes |
| --- | --- |
| `/` | Maintenance message and contact details |
| `/test` | Full website preview, equipment and latest posts |
| `/test/products` | CMS catalogue, search and category filter via `?cat=`; 10 results per page |
| `/test/products/[slug]` | Spec table, included services, enquiry rail |
| `/test/blog` · `/test/blog/[slug]` | CMS posts, arrival notices and image galleries |
| `/test/service` | The six-stage support sequence + manufacturer front door |
| `/test/about` · `/test/contact` | Company, channels |
| `/test/admin` | Protected CMS and manual proformas |

See [preview routing](docs/TEST-ROUTES.md) for auth, media and scheduled-job paths.
The public preview is no-index, not password-protected; admin still requires sign-in.

## Content

The product/category CMS and seven-day proforma drafts are now implemented.
See [CMS setup](docs/CMS.md) for private Blob configuration and
[email setup](docs/EMAIL.md) for `info@stemedicaet.com` on Porkbun.
- **Products, categories and posts** are managed through the CMS. Local preview uses the configured Neon test branch.
- **Test data** is labelled illustrative content. See [scale preview](docs/SCALE-PREVIEW.md) for the repeatable 100-product / 10-category / 60-post dataset.
- **Site config**, `src/lib/site.ts` (phone, email, WhatsApp, nav).

> Product specs, availability and lead times are **placeholders**. Device names and
> departments are drawn from STEM MEDICA's public posts; everything else needs the
> real product list before this goes live.

## Design system

Tokens live in `src/app/globals.css` under `@theme`, so Tailwind utilities
(`bg-navy-deep`, `text-scarlet`, `border-hair`) come straight from the brand doc.
Colours are eyedropped from a raster logo, replace them from the vector source.

Typography is one variable family (Archivo) used across its width axis:
`.wdth-xw` / `.wdth-w` / `.wdth-n`. IBM Plex Mono carries every number, model code
and label. Noto Sans Ethiopic is wired up for Amharic.

## Further plans

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the original architecture proposal;
[CMS](docs/CMS.md) and [auth](docs/AUTH.md) describe the implemented workflows.
