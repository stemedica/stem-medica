"""
Derive clean PNG assets from the supplied logo, public/stem-medica.jpg.

Outputs:
  src/app/icon.png    emblem only, square, transparent    (favicon)
  public/emblem-white.png  emblem only, square, white ground (spare)
  public/emblem.png   emblem only, square, transparent    (spare)
  public/logo.png     full lockup, tight crop, transparent (header/footer)

The supplied logo is a tight lockup: the "M" of STEM overlaps the emblem's
bounding box, so a rectangular crop cannot separate them. This labels connected
ink regions instead and keeps only the four shapes that make up the emblem.

Re-run if the source artwork changes:  python3 scripts/extract-emblem.py
"""
from collections import deque
from PIL import Image

SRC = "public/stem-medica.jpg"
EMBLEM_OUTS = [("src/app/icon.png", 180, None),
               ("public/emblem.png", 512, None),
               ("public/emblem-white.png", 512, "white")]
LOCKUP_OUT = ("public/logo.png", 3)   # 3x the source crop
WHITE = 232          # background threshold
MIN_AREA = 40        # ignore JPEG speckle
PAD_RATIO = 0.08     # breathing room inside the square

im = Image.open(SRC).convert("RGB")
W, H = im.size
px = im.load()

def is_ink(x, y):
    r, g, b = px[x, y]
    return not (r > WHITE and g > WHITE and b > WHITE)

# --- label connected components -------------------------------------------
seen = [[False] * H for _ in range(W)]
comps = []
for sx in range(W):
    for sy in range(H):
        if not is_ink(sx, sy) or seen[sx][sy]:
            continue
        q, pts = deque([(sx, sy)]), []
        seen[sx][sy] = True
        while q:
            x, y = q.popleft()
            pts.append((x, y))
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < W and 0 <= ny < H and not seen[nx][ny] and is_ink(nx, ny):
                        seen[nx][ny] = True
                        q.append((nx, ny))
        if len(pts) >= MIN_AREA:
            comps.append(pts)

# --- keep the emblem, drop the wordmark ------------------------------------
# The emblem sits right of and below the type. Its shapes are the ones whose
# centroid falls in the lower-right diagonal half of the artwork.
def is_emblem(pts):
    cx = sum(p[0] for p in pts) / len(pts)
    cy = sum(p[1] for p in pts) / len(pts)
    return (cx / W) + (cy / H) > 1.02

def square_png(pts, size, ground):
    """Mask `pts` onto a padded transparent (or white) square."""
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    side = max(x1 - x0 + 1, y1 - y0 + 1)
    pad = int(side * PAD_RATIO)
    side += pad * 2
    fill = (255, 255, 255, 255) if ground == "white" else (0, 0, 0, 0)
    canvas = Image.new("RGBA", (side, side), fill)
    cpx = canvas.load()
    ox = (side - (x1 - x0 + 1)) // 2 - x0
    oy = (side - (y1 - y0 + 1)) // 2 - y0
    for x, y in pts:
        r, g, b = px[x, y]
        cpx[x + ox, y + oy] = (r, g, b, 255)
    out = canvas.resize((size, size), Image.LANCZOS)
    return out.convert("RGB") if ground == "white" else out


def tight_png(pts, scale):
    """Mask `pts` onto a transparent canvas cropped tight to the ink."""
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    pad = 2
    w, h = x1 - x0 + 1 + pad * 2, y1 - y0 + 1 + pad * 2
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cpx = canvas.load()
    for x, y in pts:
        r, g, b = px[x, y]
        cpx[x - x0 + pad, y - y0 + pad] = (r, g, b, 255)
    return canvas.resize((w * scale, h * scale), Image.LANCZOS)


emblem_comps = [c for c in comps if is_emblem(c)]
emblem = [p for c in emblem_comps for p in c]
if not emblem:
    raise SystemExit("no emblem shapes found - check WHITE threshold")
print(f"emblem shapes: {len(emblem_comps)} of {len(comps)}")

for out, size, ground in EMBLEM_OUTS:
    square_png(emblem, size, ground).save(out)
    print(f"wrote {out} ({size}x{size}, {ground or 'transparent'})")

# Full lockup: every component, so the wordmark comes along, tight-cropped and
# transparent so it can sit on any light ground without a mounting plate.
lockup = [p for c in comps for p in c]
out, scale = LOCKUP_OUT
img = tight_png(lockup, scale)
img.save(out)
print(f"wrote {out} ({img.width}x{img.height}, transparent)")
