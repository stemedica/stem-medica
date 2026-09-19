"""
Build the social share card, public/og.png (1200x630).

Shown when a link is pasted into WhatsApp, LinkedIn, Telegram or Facebook.
Re-run after changing the logo or tagline:  python3 scripts/make-og-image.py
"""
from PIL import Image, ImageDraw, ImageFont
import glob

W, H = 1200, 630
NAVY_DEEP = (15, 37, 85)
NAVY = (26, 62, 143)
SCARLET = (196, 55, 46)
PAPER = (239, 241, 244)

card = Image.new("RGB", (W, H), NAVY_DEEP)
d = ImageDraw.Draw(card)

# Soft diagonal wash so the card is not a flat rectangle.
for y in range(H):
    t = y / H
    d.line([(0, y), (W, y)],
           fill=(int(15 + 18 * t), int(37 + 34 * t), int(85 + 52 * t)))

def font(size, bold=True):
    pats = ["**/Archivo*Bold*.ttf", "**/DejaVuSans-Bold.ttf"] if bold else ["**/DejaVuSans.ttf"]
    for pat in pats:
        for root in ("/usr/share/fonts", "node_modules"):
            hits = glob.glob(f"{root}/{pat}", recursive=True)
            if hits:
                return ImageFont.truetype(hits[0], size)
    return ImageFont.load_default(size)

logo = Image.open("public/logo.png").convert("RGBA")
lw = 250
logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
white = Image.new("RGBA", logo.size, (255, 255, 255, 0))
white.paste(logo, (0, 0), logo)
plate = Image.new("RGB", (logo.width + 48, logo.height + 40), (255, 255, 255))
plate.paste(white.convert("RGB"), (24, 20), white)
card.paste(plate, (80, 62))

d.text((80, 316), "Medical equipment", font=font(72), fill=(255, 255, 255))
d.text((80, 398), "for Ethiopian hospitals", font=font(72), fill=(185, 222, 236))
d.rectangle([80, 506, 172, 514], fill=SCARLET)
d.text((80, 546), "Supplied, installed and supported  ·  Addis Ababa",
       font=font(30, bold=False), fill=(200, 212, 232))

card.save("public/og.png", optimize=True)
print(f"wrote public/og.png ({W}x{H})")
