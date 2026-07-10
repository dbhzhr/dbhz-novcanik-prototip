#!/usr/bin/env python3
"""Generira iOS PWA splash screenove i OG sliku za DBHZ novčanik.

Grb (public/emblem.png, transparentan PNG) centriran na zmajsko-zelenoj #0C5430
(BRAND.md). Pokreni iz korijena repoa:  python3 scripts/gen_splash.py

Izlaz: public/icons/splash/splash-<WxH>.png (12 iOS dimenzija; media-query
linkovi u index.html) + public/og-image.png (1200x630 za OpenGraph/Twitter).
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
EMBLEM = ROOT / 'public' / 'emblem.png'
OUT = ROOT / 'public' / 'icons' / 'splash'
GREEN = (0x0C, 0x54, 0x30)  # zmajska zelena (BRAND.md)

# (width, height) — portrait; pokriva iPhone SE→16 Pro Max (vidi index.html media queries)
SIZES = [
    (640, 1136), (750, 1334), (828, 1792),
    (1125, 2436), (1170, 2532), (1179, 2556),
    (1206, 2622), (1242, 2208), (1242, 2688),
    (1284, 2778), (1290, 2796), (1320, 2868),
]


def paste_emblem(canvas: Image.Image, emblem: Image.Image, target_w: int, cx: int, cy: int) -> None:
    scale = target_w / emblem.width
    em = emblem.resize((target_w, round(emblem.height * scale)), Image.LANCZOS)
    canvas.paste(em, (cx - em.width // 2, cy - em.height // 2), em)


def main() -> None:
    emblem = Image.open(EMBLEM).convert('RGBA')
    OUT.mkdir(parents=True, exist_ok=True)

    for w, h in SIZES:
        img = Image.new('RGB', (w, h), GREEN)
        # grb ~34% širine ekrana, optički centar malo iznad polovice
        paste_emblem(img, emblem, round(w * 0.34), w // 2, round(h * 0.46))
        path = OUT / f'splash-{w}x{h}.png'
        img.save(path, optimize=True)
        print(f'  {path.relative_to(ROOT)}')

    # OG slika 1200x630 — grb centriran; naslov dodaje meta description, ne slika
    og = Image.new('RGB', (1200, 630), GREEN)
    paste_emblem(og, emblem, 340, 600, 315)
    og_path = ROOT / 'public' / 'og-image.png'
    og.save(og_path, optimize=True)
    print(f'  {og_path.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
