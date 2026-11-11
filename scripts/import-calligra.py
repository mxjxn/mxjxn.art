"""Import all 100 Calligra Pics from OpenSea shared-storefront metadata (no API key)."""
import json
import time
import urllib.request
from pathlib import Path

root = Path(__file__).resolve().parents[1]
artworks_path = root / "src/data/artworks.json"
works = json.loads(artworks_path.read_text())

creator = 0x6DA0A1784DE1ABDDE1734BA37ECA3D560BF044C0
store = "0x495f947276749Ce646f68AC8c248420045Cb7b5e"
base_index = 166  # Calligra Pic #001

local_map = {
    26: "/calligrapics/c26.jpg",
    58: "/calligrapics/c58.jpg",
    62: "/calligrapics/c62.jpg",
    74: "/calligrapics/c74.png",
    95: "/calligrapics/c95.jpg",
    100: "/calligrapics/c100.jpg",
}


def tid_for(index: int) -> int:
    return (creator << 96) | (index << 40) | 1


def fetch(index: int) -> dict:
    tid = tid_for(index)
    url = f"https://api.opensea.io/api/v1/metadata/{store}/{hex(tid)}"
    req = urllib.request.Request(
        url, headers={"User-Agent": "Mozilla/5.0 mxjxn.art-catalog"}
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)


new_calligra = []
for n in range(1, 101):
    index = base_index + (n - 1)
    meta = fetch(index)
    image = meta.get("image")
    if not image:
        raise SystemExit(f"missing image for Calligra Pic #{n}")
    src = local_map.get(n, image)
    tid = tid_for(index)
    new_calligra.append(
        {
            "slug": f"calligra-pic-{n}",
            "title": f"Calligra Pic {n}",
            "series": "calligra-pics",
            "description": meta.get("description")
            or "From a series of 100 calligraphic abstracts made in the summer of 2021.",
            "year": 2021,
            "media": [{"type": "image", "src": src}],
            "thumbnail": src,
            "animatedImage": False,
            "provenance": {
                "chain": "ethereum",
                "contract": store.lower(),
                "tokenId": str(tid),
                "url": f"https://opensea.io/item/ethereum/{store.lower()}/{tid}",
            },
        }
    )
    print(f"#{n:03d}", "local" if n in local_map else "remote")
    time.sleep(0.12)

works = [work for work in works if work.get("series") != "calligra-pics"]
works.extend(new_calligra)
artworks_path.write_text(json.dumps(works, ensure_ascii=False, indent=2) + "\n")
print(f"Imported {len(new_calligra)} Calligra Pics.")
