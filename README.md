# STEM MEDICA website

**Live:** https://www.stemedicaet.com · **Repo:** private, `natinael96/stem-medica`

Pushes to `main` deploy to production automatically via the Vercel Git integration.

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript.

Brand direction and rationale: **[docs/brand-direction.html](docs/brand-direction.html)**, open it in a browser.

```bash
npm ci          # install the locked dependencies
npm run dev     # Neon development branch · http://127.0.0.1:3000/
npm run build   # production build
```

Admin sign-in: [http://localhost:3000/auth/login](http://localhost:3000/auth/login). Development uses the isolated Neon branch configured in `.env.neon-test`; provision its account privately as described in [admin setup](docs/AUTH.md).

## What is included

| Route | Notes |
| --- | --- |
| `/` | Homepage, equipment highlights and latest posts |
| `/products` | CMS catalogue, search and category filter via `?cat=`; 10 results per page |
| `/products/[slug]` | Spec table, included services, enquiry rail |
| `/blog` · `/blog/[slug]` | CMS posts, arrival notices and image galleries |
| `/service` | Installation, training, spare parts and technical support |
| `/about` · `/contact` | Company, channels |
| `/admin` | Protected CMS, quotation-request inbox and proformas |

See [application routes](docs/ROUTES.md) for auth, media and scheduled-job paths. Admin routes require sign-in.

## Content

The catalogue, posts, quotation requests and seven-day proforma drafts use Neon in production.
See [CMS setup](docs/CMS.md) for private Blob configuration and
[email setup](docs/EMAIL.md) for `info@stemedicaet.com` on Porkbun.
- **Products, categories and posts** are managed through the CMS. Local preview uses the configured Neon test branch.
- **Production starts empty.** Preview fixtures stay confined to the test branch and cleanup tooling.
- **Site config**, `src/lib/site.ts` (phone, email, WhatsApp, nav).

Only approved products and posts should be added through the production admin.

## Design system

Tokens live in `src/app/globals.css` under `@theme`, so Tailwind utilities
(`bg-navy-deep`, `text-scarlet`, `border-hair`) come straight from the brand doc.
Colours are eyedropped from a raster logo, replace them from the vector source.

Typography is one variable family (Archivo) used across its width axis:
`.wdth-xw` / `.wdth-w` / `.wdth-n`. IBM Plex Mono carries every number, model code
and label. Noto Sans Ethiopic is wired up for Amharic.

## Operations

[Architecture](docs/ARCHITECTURE.md), [CMS](docs/CMS.md), [authentication](docs/AUTH.md) and [operations](docs/OPERATIONS.md) describe the production workflows.

