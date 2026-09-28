const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const CATALOGUE_PATH = path.resolve(".local-storage/catalogue/current.json");
const MEDIA_DIR = path.resolve(".local-storage/media");
const PREVIEW_HTML = path.resolve("public/device-images-preview.html");

if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// Custom queries tailored to each product for high-precision image search
const QUERY_MAP = {
  "digital-patient-monitor-heure": "multi parameter patient monitor vital signs hospital medical",
  "portable-vital-sign-monitor-edan": "Edan M3 vital signs monitor portable medical",
  "patient-monitor-david": "Ningbo David medical patient monitor",
  "patient-monitor-ibp-etco2-bpl": "BPL patient monitor Ultima IBP EtCO2",
  "ambulatory-blood-pressure-monitor-schiller": "Schiller BR-102 plus ambulatory blood pressure monitor",
  "holter-ecg-finecare": "12 lead Holter ECG recorder dynamic monitor medical",
  "ecg-machine-aeomed-bpl": "BPL 12 channel ECG machine Cardioart",
  "ecg-machine-with-trolley": "12 channel ECG machine with trolley cart hospital",
  "ecg-electrode-linear": "disposable ECG electrodes monitoring medical",
  "infant-weight-scale-mindray": "digital pediatric baby infant weight scale medical",
  "defibrillator": "biphasic defibrillator monitor hospital medical",
  "cpap-machine-yuell": "Yuwell CPAP machine sleep apnea therapy",
  "mechanical-ventilator": "ICU mechanical ventilator medical equipment hospital",
  "oxygen-concentrator-yuwell-longfian": "Yuwell 10L oxygen concentrator medical",
  "suction-machine-k15-creative": "Creative Medical suction unit K15 electric suction pump",
  "stretcher-asco": "hospital emergency patient transfer stretcher trolley",
  "led-radiant-warmer-xhz-90l": "David infant radiant warmer XHZ-90L",
  "incubator-david-hkn-90": "Ningbo David infant incubator HKN-90",
  "infusion-pump-david-yp-90a": "medical volumetric infusion pump hospital David",
  "phototherapy-machine-david": "Ningbo David neonatal phototherapy unit jaundice",
  "phototherapy-machine-biloght-e65": "neonatal infant phototherapy lamp jaundice unit",
  "eeg-fuji": "digital EEG machine 32 channel electroencephalograph",
  "emg-fuji": "EMG machine electromyography evoked potential system",
  "endoscopy-fuji": "Fujifilm endoscopy system processor video gastroscope",
  "videolaryngoscopy-mindray": "Mindray video laryngoscope medical airway",
  "fully-automated-hormone-analyzer-bande": "automated chemiluminescence immunoassay hormone analyzer",
  "immunoassay-analyzer-mindray": "Mindray CL-900i chemiluminescence immunoassay analyzer",
  "esr-machine-bpl": "automated ESR analyzer erythrocyte sedimentation rate BPL",
  "eeg-paste-saikang": "Ten20 conductive EEG paste medical",
  "ent-treatment-unit": "ENT treatment workstation unit chair clinic",
  "surgical-laser-amoul": "surgical diode laser system surgery medical",
  "anesthesia-machine-sikang": "hospital anesthesia workstation machine ventilator",
  "operating-table": "electric surgical operating table hospital theater",
  "laparoscopy": "laparoscopy tower endoscopic surgery camera system HD",
  "cath-lab-system": "cardiac catheterization lab angiography system",
  "examination-light-creative": "LED surgical examination light shadowless lamp",
  "pacemaker-abott": "Abbott cardiac pacemaker implantable medical",
  "standard-hospital-bed-nbi": "manual hospital patient bed medical furniture",
  "manual-hospital-bed-3-function-mindray": "hospital bed 3 function manual crank medical",
  "x-ray-angle": "Angell digital radiography x-ray system hospital",
  "mammography-anglee": "digital mammography machine breast imaging x-ray",
  "c-arm-bpl": "BPL mobile C-arm fluoroscopy surgical x-ray",
  "mri-nihon-kohden": "medical 1.5T MRI scanner machine hospital",
  "ct-scan-nihon-kohden": "medical CT scanner computed tomography system hospital",
  "portable-ultrasound-umec15": "portable ultrasound machine color doppler medical",
  "auto-hematology-analyzer-bc-30s": "Mindray BC-30s auto hematology analyzer",
  "auto-hematology-analyzer-bc-20s": "Mindray BC-20s auto hematology analyzer",
  "semi-auto-chemistry-analyzer-ba-88a": "Mindray BA-88A semi-auto chemistry analyzer",
  "full-chemistry-analyzer-bs-230": "Mindray BS-230 clinical chemistry analyzer",
  "autoclave-250l-mindray": "horizontal autoclave 250L steam sterilizer hospital",
  "dialysis-machine-surdial": "Nipro Surdial hemodialysis machine dialysis"
};

async function searchBingImages(query) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query + " white background")}&form=HDRSC2&first=1`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml"
      }
    });
    if (!res.ok) return [];
    const html = await res.text();
    const matches = [...html.matchAll(/murl&quot;:&quot;(http[^&]+)&quot;/g)].map(m => m[1]);
    if (matches.length > 0) return matches;
    const directMatches = [...html.matchAll(/"murl":"(http[^"]+)"/g)].map(m => m[1]);
    return directMatches;
  } catch (err) {
    console.error(`Error searching Bing for "${query}":`, err.message);
    return [];
  }
}

async function downloadAndProcessImage(urls) {
  for (const url of urls.slice(0, 7)) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!res.ok) continue;

      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 5000) continue; // Skip tiny / tracking icons

      // Validate with sharp
      const meta = await sharp(buffer).metadata();
      if (!meta.width || !meta.height) continue;
      if (meta.width < 180 || meta.height < 180) continue;

      // Contain in 800x800 square with crisp white background
      const processed = await sharp(buffer)
        .resize(800, 800, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .webp({ quality: 85 })
        .toBuffer();

      return { processed, sourceUrl: url };
    } catch {
      // try next url
      continue;
    }
  }
  return null;
}

async function run() {
  const catalogueRaw = fs.readFileSync(CATALOGUE_PATH, "utf8");
  const catalogue = JSON.parse(catalogueRaw);

  console.log(`Starting image search & download for ${catalogue.products.length} products...`);

  const results = [];

  for (let i = 0; i < catalogue.products.length; i++) {
    const product = catalogue.products[i];
    const query = QUERY_MAP[product.slug] || `${product.brand !== "—" ? product.brand : ""} ${product.model} ${product.name} medical equipment`;

    console.log(`\n[${i + 1}/${catalogue.products.length}] ${product.name} (${product.brand} ${product.model})`);
    console.log(`Query: "${query}"`);

    const urls = await searchBingImages(query);
    if (!urls || urls.length === 0) {
      console.log(`⚠️  No image URLs found for ${product.slug}`);
      results.push({ product, success: false });
      continue;
    }

    const downloaded = await downloadAndProcessImage(urls);
    if (!downloaded) {
      console.log(`⚠️  Failed to download/process any candidate image for ${product.slug}`);
      results.push({ product, success: false });
      continue;
    }

    const uuid = crypto.randomUUID();
    const filename = `${uuid}.webp`;
    const filePath = path.join(MEDIA_DIR, filename);
    fs.writeFileSync(filePath, downloaded.processed);

    const mediaPath = `/media/${filename}`;
    product.image = mediaPath;

    console.log(`✅ Saved ${mediaPath} (${(downloaded.processed.length / 1024).toFixed(1)} KB) from ${downloaded.sourceUrl.slice(0, 60)}...`);
    results.push({
      product,
      success: true,
      mediaPath,
      size: (downloaded.processed.length / 1024).toFixed(1) + " KB",
      sourceUrl: downloaded.sourceUrl
    });

    // Short pause to avoid search rate limiting
    await new Promise(r => setTimeout(r, 600));
  }

  // Save updated catalogue
  fs.writeFileSync(CATALOGUE_PATH, JSON.stringify(catalogue, null, 2), "utf8");
  console.log(`\nUpdated ${CATALOGUE_PATH} successfully!`);

  // Generate an HTML preview page for the user to review locally
  generatePreviewHtml(results);
}

function generatePreviewHtml(results) {
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
    .status { margin-top: auto; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; display: inline-block; }
    .status-ok { background: #dcfce7; color: #166534; font-weight: 600; }
    .status-fail { background: #fee2e2; color: #991b1b; font-weight: 600; }
  </style>
</head>
<body>
  <h1>STEM MEDICA - Device Images Review</h1>
  <p class="lead">Showing ${results.filter(r => r.success).length} of ${results.length} device images found and processed locally.</p>
  <div class="grid">
    ${results.map((r, i) => `
      <div class="card">
        <div class="img-box">
          ${r.success ? `<img src="${r.mediaPath}" alt="${r.product.name}" loading="lazy" />` : `<span style="color:#94a3b8;font-size:0.875rem;">No image found</span>`}
        </div>
        <div class="content">
          <div class="category">${r.product.category}</div>
          <h3 class="title">${i + 1}. ${r.product.name}</h3>
          <div class="meta">
            ${r.product.brand && r.product.brand !== '—' ? `<strong>Brand:</strong> ${r.product.brand}<br>` : ''}
            ${r.product.model ? `<strong>Model:</strong> ${r.product.model}<br>` : ''}
            ${r.size ? `<strong>Size:</strong> ${r.size}` : ''}
          </div>
          <div>
            ${r.success ? `<span class="status status-ok">✓ Ready (${r.mediaPath})</span>` : `<span class="status status-fail">✗ Missing</span>`}
          </div>
        </div>
      </div>
    `).join("")}
  </div>
</body>
</html>`;

  fs.writeFileSync(PREVIEW_HTML, html, "utf8");
  console.log(`Created review page at: ${PREVIEW_HTML}`);
}

run().catch(console.error);
