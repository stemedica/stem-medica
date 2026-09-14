"""
Extract the circular emblem from public/stem-medica.jpg as a transparent,
square PNG for use as the favicon.

The supplied logo is a tight lockup: the "M" of STEM overlaps the emblem's
bounding box, so a rectangular crop cannot separate them. This labels connected
ink regions instead and keeps only the four shapes that make up the emblem.

Re-run if the source artwork changes:  python3 scripts/extract-emblem.py
"""
from collections import deque
from PIL import Image

SRC = "public/stem-medica.jpg"
OUTS = [("src/app/icon.png", 180), ("public/emblem.png", 512)]
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

emblem = [p for c in comps if is_emblem(c) for p in c]
if not emblem:
    raise SystemExit("no emblem shapes found - check WHITE threshold")

xs = [p[0] for p in emblem]
ys = [p[1] for p in emblem]
x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
print(f"emblem shapes: {sum(1 for c in comps if is_emblem(c))}  "
      f"bbox x {x0}..{x1} y {y0}..{y1}")

# --- build a transparent square --------------------------------------------
mask = set(emblem)
side = max(x1 - x0 + 1, y1 - y0 + 1)
pad = int(side * PAD_RATIO)
side += pad * 2
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
cpx = canvas.load()
ox = (side - (x1 - x0 + 1)) // 2 - x0
oy = (side - (y1 - y0 + 1)) // 2 - y0
for x, y in mask:
    r, g, b = px[x, y]
    cpx[x + ox, y + oy] = (r, g, b, 255)

for out, size in OUTS:
    canvas.resize((size, size), Image.LANCZOS).save(out)
    print(f"wrote {out} ({size}x{size})")
