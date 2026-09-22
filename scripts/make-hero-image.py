"""
Crop the supplied hero artwork down to its photograph.

The source (public/stem-medica-hero.png) is a square marketing graphic with a
headline, a tagline and six claim labels rendered into the pixels. None of that
can be read by a search engine or a screen reader, none of it reflows on a
phone, and it would sit underneath the page's own <h1>. The lower portion is a
clean theatre photograph, which is the part worth keeping.

Also re-encodes: the source is a 1.9 MB PNG, and this is the largest paint on
the primary device (Android, often a slow connection).

    python3 scripts/make-hero-image.py
"""
from PIL import Image
from pathlib import Path

SRC = Path("public/stem-medica-hero.png")
OUT = Path("public/hero-theatre.jpg")

# Text occupies the top ~29% of the square; the corner chevrons run to ~96%.
TOP = 0.30
BOTTOM = 0.965

def main() -> None:
    image = Image.open(SRC).convert("RGB")
    width, height = image.size
    photo = image.crop((0, round(height * TOP), width, round(height * BOTTOM)))
    photo.save(OUT, "JPEG", quality=78, optimize=True, progressive=True)
    print(f"{SRC} {width}x{height} {SRC.stat().st_size // 1024} KB")
    print(f"{OUT} {photo.size[0]}x{photo.size[1]} {OUT.stat().st_size // 1024} KB")

if __name__ == "__main__":
    main()
