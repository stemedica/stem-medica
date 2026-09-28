const fs = require("fs");
const path = require("path");

const CATALOGUE_PATH = path.resolve(".local-storage/catalogue/current.json");
const LOCAL_MEDIA_DIR = path.resolve(".local-storage/media");
const PUBLIC_MEDIA_DIR = path.resolve("public/media");
const PREVIEW_HTML = path.resolve("public/device-images-preview.html");

if (!fs.existsSync(PUBLIC_MEDIA_DIR)) {
  fs.mkdirSync(PUBLIC_MEDIA_DIR, { recursive: true });
}

function run() {
  const catalogue = JSON.parse(fs.readFileSync(CATALOGUE_PATH, "utf8"));
  console.log(`Renaming photos for ${catalogue.products.length} products...`);

  // Map each product to its renamed image
  const reviewItems = [];

  for (const product of catalogue.products) {
    if (!product.image) continue;

    // Current filename, e.g. /media/acac8790-8a83-4f48-ba51-0f3054114384.webp
    const currentName = path.basename(product.image);

    // If it already starts with the slug, skip renaming
    if (currentName.startsWith(`${product.slug}-`)) {
      console.log(`Already named: ${currentName}`);
      reviewItems.push({ product, newMediaPath: product.image });
      continue;
    }

    // Extract UUID part from current filename
    const uuidMatch = currentName.match(/[a-f0-9-]{36}/);
    const uuid = uuidMatch ? uuidMatch[0] : Math.random().toString(36).substring(2, 10);

    const newFilename = `${product.slug}-${uuid}.webp`;
    const newMediaPath = `/media/${newFilename}`;

    // Rename in .local-storage/media
    const oldLocalPath = path.join(LOCAL_MEDIA_DIR, currentName);
    const newLocalPath = path.join(LOCAL_MEDIA_DIR, newFilename);
    if (fs.existsSync(oldLocalPath)) {
      fs.copyFileSync(oldLocalPath, newLocalPath);
      // Clean up old file if name changed
      if (oldLocalPath !== newLocalPath) {
        fs.unlinkSync(oldLocalPath);
      }
    }

    // Rename / copy in public/media
    const oldPublicPath = path.join(PUBLIC_MEDIA_DIR, currentName);
    const newPublicPath = path.join(PUBLIC_MEDIA_DIR, newFilename);
    if (fs.existsSync(oldPublicPath)) {
      fs.copyFileSync(oldPublicPath, newPublicPath);
      if (oldPublicPath !== newPublicPath) {
        fs.unlinkSync(oldPublicPath);
      }
    } else if (fs.existsSync(newLocalPath)) {
      fs.copyFileSync(newLocalPath, newPublicPath);
    }

    // Update product image path
    product.image = newMediaPath;
    console.log(`✅ ${product.slug} -> ${newFilename}`);
    reviewItems.push({ product, newMediaPath });
  }

  // Save catalogue
  fs.writeFileSync(CATALOGUE_PATH, JSON.stringify(catalogue, null, 2), "utf8");
  console.log(`\nUpdated catalogue: ${CATALOGUE_PATH}`);

  // Re-generate preview HTML with new paths
  updatePreviewHtml(catalogue.products);
}

function updatePreviewHtml(products) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>STEM MEDICA - Device Images Review</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 2rem; }
    h1 { margin-bottom: 0.5rem; }
    p.lead { color: #64748b; margin-top: 0; margin-bottom: 2rem; font-size: 1.1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
    .img-box { width: 100%; aspect-ratio: 1; background: #ffffff; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #f1f5f9; padding: 1rem; box-sizing: border-box; }
    .img-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .content { padding: 1rem; flex: 1; display: flex; flex-direction: column; }
    .category { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600; margin-bottom: 0.25rem; }
    .title { font-weight: 700; font-size: 1rem; margin: 0 0 0.5rem 0; color: #0f172a; line-height: 1.3; }
    .meta { font-size: 0.825rem; color: #475569; margin-bottom: 0.5rem; }
    .filename { font-family: monospace; font-size: 0.72rem; word-break: break-all; background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 4px; margin-top: 0.4rem; display: block; color: #334155; }
    .status { margin-top: auto; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; display: inline-block; }
    .status-ok { background: #dcfce7; color: #166534; font-weight: 600; }
  </style>
</head>
<body>
  <h1>STEM MEDICA - Device Images Review</h1>
  <p class="lead">Showing ${products.filter(p => p.image).length} of ${products.length} device images with descriptive names.</p>
  <div class="grid">
    ${products.map((p, i) => `
      <div class="card">
        <div class="img-box">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="content">
          <div class="category">${p.category}</div>
          <h3 class="title">${i + 1}. ${p.name}</h3>
          <div class="meta">
            ${p.brand && p.brand !== '—' ? `<strong>Brand:</strong> ${p.brand}<br>` : ''}
            ${p.model ? `<strong>Model:</strong> ${p.model}<br>` : ''}
            <span class="filename">${p.image}</span>
          </div>
          <div>
            <span class="status status-ok">✓ Ready</span>
          </div>
        </div>
      </div>
    `).join("")}
  </div>
</body>
</html>`;

  fs.writeFileSync(PREVIEW_HTML, html, "utf8");
  console.log(`Updated review page at: ${PREVIEW_HTML}`);
}

run();
