#!/usr/bin/env python3
"""Extrait modèles et vignettes depuis le catalogue Masterline (PDF)."""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
PDF_DEFAULT = (
    Path.home()
    / ".cursor"
    / "projects"
    / "c-Users-skhas-Documents-roblbc"
    / "attachments"
    / "1817874c-e93d-42c3-bae0-80109c79cb63"
    / "Masterline_E-Catalog-FR_-_PORTES_D_ENTREES__1__1.pdf"
)
PDF_DOWNLOADS = Path.home() / "Downloads" / "Masterline_E-Catalog-FR - PORTES D'ENTREES (1).pdf"
PDF = PDF_DEFAULT if PDF_DEFAULT.exists() else PDF_DOWNLOADS
OUT_DIR = ROOT / "img" / "modele-masterline"
JSON_OUT = ROOT / "js" / "door-models.json"
BUNDLE_OUT = ROOT / "js" / "door-models-bundle.js"
CATALOG_PDF = ROOT / "docs" / "Masterline-portes-entree.pdf"

CODE_RE = re.compile(r"^MS\d{3,4}[A-Z]?$")
VARIANT_CODE_RE = re.compile(r"^MS\d{3,4}L$", re.I)
VARIANT_LINE_RE = re.compile(r"^(.+?)\s+(MS\d{3,4}L)$", re.I)
# Pages 2–10 du PDF (index 1–9) : grilles de modèles ; 11–14 : variantes couleur
PAGE_RANGE = range(1, 10)
VARIANT_PAGE_RANGE = range(10, 14)

PANEL_COLOR_HEX = {
    "blanc": "#f3f3ef",
    "noyer": "#4a3428",
    "walnut": "#5c4030",
    "acajou": "#6b3a2e",
    "chêne doré": "#b07a45",
    "chene dore": "#b07a45",
    "chêne foncé": "#7a5230",
    "chene fonce": "#7a5230",
    "anthracite": "#3a4044",
    "mandarine": "#c45c2a",
    "satiné": "#d8d0c4",
    "satine": "#d8d0c4",
}


def pdf_path() -> Path:
    if PDF.exists():
        return PDF
    alt = list(Path.home().glob("**/Masterline*PORTES*.pdf"))
    if alt:
        return alt[0]
    raise FileNotFoundError("PDF Masterline introuvable")


def label_blocks(page: fitz.Page) -> list[tuple[str, fitz.Rect]]:
    out: list[tuple[str, fitz.Rect]] = []
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                t = span["text"].strip()
                if CODE_RE.match(t):
                    out.append((t, fitz.Rect(span["bbox"])))
    return out


def door_images(page: fitz.Page) -> list[fitz.Rect]:
    rects: list[fitz.Rect] = []
    for info in page.get_image_info():
        r = fitz.Rect(info["bbox"])
        pw, ph = info.get("width") or 0, info.get("height") or 0
        if ph >= 180 and pw >= 120:
            rects.append(r)
    # dédupliquer positions proches (plusieurs xref pour la même vignette)
    uniq: list[fitz.Rect] = []
    for r in sorted(rects, key=lambda x: (x.x0, x.y0)):
        if any(r.intersects(u) and abs(r.width - u.width) < 8 for u in uniq):
            continue
        uniq.append(r)
    return uniq


def match_label_to_image(label: fitz.Rect, images: list[fitz.Rect]) -> fitz.Rect | None:
    lx = (label.x0 + label.x1) / 2
    best = None
    best_score = 1e9
    for img in images:
        if img.y1 > label.y0 + 5:
            continue
        ix = (img.x0 + img.x1) / 2
        dx = abs(ix - lx)
        gap = label.y0 - img.y1
        if gap < -20 or gap > 280:
            continue
        score = dx * 2 + gap
        if score < best_score:
            best_score = score
            best = img
    return best


def base_code(code: str) -> str:
    return re.sub(r"L$", "", code, flags=re.I)


def color_key(label: str) -> str:
    return (
        label.lower()
        .replace("é", "e")
        .replace("è", "e")
        .replace("ê", "e")
        .strip()
    )


def color_hex(label: str) -> str:
    k = color_key(label)
    for name, hx in PANEL_COLOR_HEX.items():
        if color_key(name) == k or k.startswith(color_key(name)):
            return hx
    return "#c8b8a8"


def parse_variant_lines(page: fitz.Page) -> list[tuple[str, str]]:
    """Retourne (libellé couleur, code MS…L) dans l'ordre du PDF."""
    lines = [ln.strip() for ln in page.get_text().splitlines() if ln.strip()]
    out: list[tuple[str, str]] = []
    pending: str | None = None
    for line in lines:
        if line.isdigit():
            continue
        m = VARIANT_LINE_RE.match(line)
        if m:
            out.append((m.group(1).strip(), m.group(2).upper()))
            pending = None
            continue
        if VARIANT_CODE_RE.match(line):
            if pending:
                out.append((pending, line.upper()))
            pending = None
            continue
        if not CODE_RE.match(line):
            pending = line
    return out


def variant_id(base: str, couleur: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", color_key(couleur)).strip("-")
    return f"{base.lower()}-{slug or 'couleur'}"


def has_glass_from_crop(doc: fitz.Page, rect: fitz.Rect) -> bool:
    """Heuristique : zone vitrée = pixels plus clairs au centre haut du panneau."""
    pix = doc.get_pixmap(clip=rect, dpi=72)
    w, h = pix.width, pix.height
    if w < 10 or h < 10:
        return False
    samples = []
    for y in range(int(h * 0.12), int(h * 0.45), max(1, h // 12)):
        for x in range(int(w * 0.25), int(w * 0.75), max(1, w // 8)):
            i = (y * w + x) * 3
            r, g, b = pix.samples[i], pix.samples[i + 1], pix.samples[i + 2]
            samples.append((r + g + b) / 3)
    if not samples:
        return False
    avg = sum(samples) / len(samples)
    return avg > 165


def main() -> None:
    pdf = pdf_path()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    CATALOG_PDF.parent.mkdir(parents=True, exist_ok=True)
    if not CATALOG_PDF.exists():
        shutil.copy2(pdf, CATALOG_PDF)

    doc = fitz.open(pdf)
    by_base: dict[str, dict] = {}

    for pno in PAGE_RANGE:
        page = doc[pno]
        labels = label_blocks(page)
        images = door_images(page)
        for code, lrect in labels:
            irect = match_label_to_image(lrect, images)
            if not irect:
                continue
            b = base_code(code)
            pix = page.get_pixmap(clip=irect, dpi=150)
            fname = f"{b.lower()}.png"
            dest = OUT_DIR / fname
            pix.save(dest)
            entry = by_base.get(b) or {
                "id": b.lower(),
                "name": b,
                "famille": "pvc",
                "imgLocal": f"img/modele-masterline/{fname}",
                "source": "masterline",
                "variants": [],
                "colorVariants": [],
            }
            if code not in entry["variants"]:
                entry["variants"].append(code)
            entry["glass"] = has_glass_from_crop(page, irect)
            entry["pattern"] = "glassMid" if entry["glass"] else "solid"
            by_base[b] = entry

    for pno in VARIANT_PAGE_RANGE:
        page = doc[pno]
        pairs = parse_variant_lines(page)
        images = sorted(door_images(page), key=lambda r: (round(r.y0), r.x0))
        for i, (couleur, code) in enumerate(pairs):
            if i >= len(images):
                break
            b = base_code(code)
            entry = by_base.get(b)
            if not entry:
                continue
            vid = variant_id(b, couleur)
            fname = f"{vid}.png"
            dest = OUT_DIR / fname
            page.get_pixmap(clip=images[i], dpi=150).save(dest)
            cv = {
                "id": vid,
                "code": code,
                "couleur": couleur,
                "hex": color_hex(couleur),
                "imgLocal": f"img/modele-masterline/{fname}",
            }
            existing = {v["id"] for v in entry["colorVariants"]}
            if vid not in existing:
                entry["colorVariants"].append(cv)
            if code not in entry["variants"]:
                entry["variants"].append(code)

    for entry in by_base.values():
        entry["colorVariants"].sort(key=lambda v: v["couleur"])

    models = sorted(by_base.values(), key=lambda m: m["name"])
    JSON_OUT.write_text(json.dumps(models, ensure_ascii=False, indent=2), encoding="utf-8")
    BUNDLE_OUT.write_text(
        "window.DOOR_MODELS = " + json.dumps(models, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"PDF: {pdf}")
    print(f"{len(models)} modèles → {JSON_OUT}")
    print(f"Vignettes → {OUT_DIR}")


if __name__ == "__main__":
    main()
