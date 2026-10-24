#!/usr/bin/env python3
"""Télécharge les vignettes modèles dans img/modele/."""
from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON = ROOT / "js" / "door-models.json"
BUNDLE = ROOT / "js" / "door-models-bundle.js"
IMG = ROOT / "img" / "modele"
UA = "DirectUsine/1.0 (catalog sync)"


def write_bundle(models: list) -> None:
    BUNDLE.write_text(
        "window.DOOR_MODELS = " + json.dumps(models, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )


def main() -> None:
    models = json.loads(JSON.read_text(encoding="utf-8"))
    IMG.mkdir(parents=True, exist_ok=True)
    for m in models:
        url = m["img"]
        ext = Path(urllib.parse.urlparse(url).path).suffix or ".jpg"
        dest = IMG / f"{m['id']}_small{ext}"
        if dest.exists() and dest.stat().st_size > 2000:
            m["imgLocal"] = f"img/modele/{dest.name}"
            continue
        req = urllib.request.Request(
            url,
            headers={"User-Agent": UA, "Referer": "https://www.voletroulant-online.fr/"},
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = resp.read()
        dest.write_bytes(data)
        m["imgLocal"] = f"img/modele/{dest.name}"
        print(f"OK {m['id']} ({len(data) // 1024} Ko)")
        time.sleep(4)
    JSON.write_text(json.dumps(models, ensure_ascii=False, indent=2), encoding="utf-8")
    write_bundle(models)
    print("Terminé.")


if __name__ == "__main__":
    main()
