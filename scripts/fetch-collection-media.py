#!/usr/bin/env python3
"""Archive Calligra Pics (ETH/OpenSea) and Muse Editions (Base) originals locally."""
from __future__ import annotations

import json
import mimetypes
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTWORKS = ROOT / "src/data/artworks.json"
CALLIGRA_DIR = ROOT / "public/calligrapics"
MUSE_DIR = ROOT / "public/muse-editions"
LOG_PATH = ROOT / "scripts/fetch-collection-media.log"

CALLIGRA_CREATOR = 0x6DA0A1784DE1ABDDE1734BA37ECA3D560BF044C0
CALLIGRA_STORE = "0x495f947276749Ce646f68AC8c248420045Cb7b5e"
CALLIGRA_BASE_INDEX = 166

MUSE_CONTRACT = "0x528fd133d6fb004faccc08b70e04186299eba176"
MUSE_RPCS = [
    "https://base.gateway.tenderly.co",
    "https://base.llamarpc.com",
    "https://1rpc.io/base",
]

UA = "Mozilla/5.0 mxjxn.art-media-archive"


def log(msg: str) -> None:
    line = msg.rstrip()
    print(line, flush=True)
    with LOG_PATH.open("a", encoding="utf-8") as fh:
        fh.write(line + "\n")


def request(url: str, timeout: int = 120) -> tuple[bytes, str | None]:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return response.read(), response.headers.get("Content-Type")


def ext_for(content_type: str | None, url: str, default: str = "bin") -> str:
    if content_type:
        ct = content_type.split(";")[0].strip().lower()
        mapping = {
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/png": "png",
            "image/gif": "gif",
            "image/webp": "webp",
            "video/mp4": "mp4",
            "video/webm": "webm",
            "model/gltf-binary": "glb",
            "application/octet-stream": None,
        }
        if ct in mapping and mapping[ct]:
            return mapping[ct]
        guessed = mimetypes.guess_extension(ct)
        if guessed:
            return guessed.lstrip(".")
    path = url.split("?")[0]
    if "." in path.rsplit("/", 1)[-1]:
        return path.rsplit(".", 1)[-1].lower()[:8]
    return default


def download(url: str, dest: Path, retries: int = 3) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    last_err: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            data, content_type = request(url)
            if dest.suffix in {"", ".bin"}:
                dest = dest.with_suffix("." + ext_for(content_type, url))
            tmp = dest.with_suffix(dest.suffix + ".part")
            tmp.write_bytes(data)
            tmp.replace(dest)
            return dest
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            time.sleep(min(2 * attempt, 8))
    raise RuntimeError(f"download failed {url}: {last_err}")


def public_path(path: Path) -> str:
    return "/" + str(path.relative_to(ROOT / "public")).replace("\\", "/")


def calligra_tid(index: int) -> int:
    return (CALLIGRA_CREATOR << 96) | (index << 40) | 1


def fetch_calligra_meta(n: int) -> dict:
    index = CALLIGRA_BASE_INDEX + (n - 1)
    tid = calligra_tid(index)
    url = f"https://api.opensea.io/api/v1/metadata/{CALLIGRA_STORE}/{hex(tid)}"
    data, _ = request(url, timeout=30)
    meta = json.loads(data)
    meta["_token_id"] = str(tid)
    meta["_index"] = index
    return meta


def eth_call(rpc: str, data: str) -> str:
    body = json.dumps(
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_call",
            "params": [{"to": MUSE_CONTRACT, "data": data}, "latest"],
        }
    ).encode()
    req = urllib.request.Request(
        rpc,
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": UA},
    )
    with urllib.request.urlopen(req, timeout=20) as response:
        payload = json.load(response)
    if "result" not in payload or not payload["result"]:
        raise RuntimeError(f"bad eth_call: {payload}")
    return payload["result"]


def decode_abi_string(hexdata: str) -> str:
    h = hexdata[2:]
    offset = int(h[0:64], 16) * 2
    length = int(h[offset : offset + 64], 16)
    raw = h[offset + 64 : offset + 64 + length * 2]
    return bytes.fromhex(raw).decode("utf-8", errors="replace")


def muse_token_uri(token_id: int) -> str:
    data = "0x0e89341c" + format(token_id, "064x")
    last: Exception | None = None
    for rpc in MUSE_RPCS:
        try:
            return decode_abi_string(eth_call(rpc, data))
        except Exception as exc:  # noqa: BLE001
            last = exc
            continue
    raise RuntimeError(f"uri({token_id}) failed: {last}")


def fetch_json(url: str) -> dict:
    data, content_type = request(url, timeout=60)
    if content_type and "json" in content_type:
        return json.loads(data)
    text = data.decode("utf-8", errors="replace")
    return json.loads(text)


def archive_calligra(works: list[dict]) -> None:
    CALLIGRA_DIR.mkdir(parents=True, exist_ok=True)
    by_slug = {w["slug"]: w for w in works}
    for n in range(1, 101):
        slug = f"calligra-pic-{n}"
        try:
            meta = fetch_calligra_meta(n)
            image = meta.get("image")
            if not image:
                raise RuntimeError("no image in metadata")
            # Keep known local masters if present and non-trivial.
            existing = by_slug.get(slug)
            current = (existing or {}).get("thumbnail") or ""
            local_candidate = CALLIGRA_DIR / f"c{n}"
            matched = list(CALLIGRA_DIR.glob(f"c{n}.*"))
            matched = [p for p in matched if p.suffix != ".part"]
            if matched and current.startswith("/calligrapics/"):
                dest = matched[0]
                log(f"calligra #{n:03d} keep {dest.name}")
            else:
                dest = download(image, local_candidate)
                log(f"calligra #{n:03d} saved {dest.name} ({dest.stat().st_size} bytes)")
            src = public_path(dest)
            tid = meta["_token_id"]
            work = {
                "slug": slug,
                "title": f"Calligra Pic {n}",
                "series": "calligra-pics",
                "description": meta.get("description")
                or "From a series of 100 calligraphic abstracts made in the summer of 2021.",
                "year": 2021,
                "media": [{"type": "image", "src": src}],
                "thumbnail": src,
                "animatedImage": dest.suffix.lower() == ".gif",
                "provenance": {
                    "chain": "ethereum",
                    "contract": CALLIGRA_STORE.lower(),
                    "tokenId": tid,
                    "url": f"https://opensea.io/item/ethereum/{CALLIGRA_STORE.lower()}/{tid}",
                },
            }
            if existing:
                for key in ("width", "height"):
                    if key in existing:
                        work[key] = existing[key]
                works[works.index(existing)] = work
            else:
                works.append(work)
        except Exception as exc:  # noqa: BLE001
            log(f"calligra #{n:03d} FAIL {exc}")
        time.sleep(0.12)


def archive_muse(works: list[dict]) -> None:
    MUSE_DIR.mkdir(parents=True, exist_ok=True)
    muse_works = [w for w in works if w.get("series") == "muse-editions"]
    token_ids = sorted(
        {
            int(w["provenance"]["tokenId"])
            for w in muse_works
            if w.get("provenance", {}).get("tokenId")
        }
        | set(range(1, 64))
    )
    by_token = {
        int(w["provenance"]["tokenId"]): w
        for w in muse_works
        if w.get("provenance", {}).get("tokenId")
    }

    for token_id in token_ids:
        slug = f"muse-editions-{token_id}"
        try:
            uri = muse_token_uri(token_id)
            meta = fetch_json(uri)
            image = meta.get("image") or meta.get("image_url")
            animation = meta.get("animation_url") or meta.get("animation")
            title = (meta.get("name") or slug).strip()
            description = meta.get("description") or ""
            media: list[dict] = []
            thumbnail = None
            animated = False

            existing = by_token.get(token_id)
            # Preserve high-quality generated video posters when present.
            existing_poster = None
            if existing:
                thumb = existing.get("thumbnail") or ""
                if thumb.startswith("/posters/muse-editions-"):
                    existing_poster = thumb

            if animation:
                anim_path = download(
                    animation, MUSE_DIR / f"{slug}-animation.bin"
                )
                anim_type = {
                    ".mp4": "video",
                    ".webm": "video",
                    ".glb": "model",
                    ".gltf": "model",
                    ".html": "interactive",
                    ".htm": "interactive",
                }.get(anim_path.suffix.lower(), "video")
                # Heuristic: HTML interactive packages sometimes served oddly
                if "html" in (meta.get("animation_details") or {}).get("format", "").lower():
                    anim_type = "interactive"
                if "glb" in (meta.get("animation_details") or {}).get("format", "").lower():
                    anim_type = "model"
                media.append(
                    {
                        "type": anim_type,
                        "src": public_path(anim_path),
                        "poster": None,
                        "unavailable": False,
                    }
                )
                log(
                    f"muse #{token_id:02d} animation {anim_path.name} ({anim_path.stat().st_size} bytes)"
                )

            if image:
                # Skip storing tiny metadata GIFs as the display original when a video exists;
                # still archive them as -image for completeness.
                img_path = download(image, MUSE_DIR / f"{slug}-image.bin")
                log(
                    f"muse #{token_id:02d} image {img_path.name} ({img_path.stat().st_size} bytes)"
                )
                img_public = public_path(img_path)
                animated = img_path.suffix.lower() == ".gif"
                if not media:
                    media.append({"type": "image", "src": img_public})
                    thumbnail = img_public
                else:
                    # Video/model/interactive primary; image is poster unless we have a better one
                    if existing_poster:
                        media[0]["poster"] = existing_poster
                        thumbnail = existing_poster
                        animated = False
                    elif img_path.suffix.lower() == ".gif":
                        media[0]["poster"] = existing_poster or img_public
                        thumbnail = existing_poster or img_public
                        animated = not existing_poster
                    else:
                        media[0]["poster"] = img_public
                        thumbnail = img_public
                        animated = False
            elif media:
                thumbnail = existing_poster or media[0]["src"]
            else:
                raise RuntimeError("no image or animation in metadata")

            if not thumbnail:
                thumbnail = media[0].get("poster") or media[0]["src"]

            work = {
                "slug": slug,
                "title": title,
                "series": "muse-editions",
                "description": description,
                "year": existing.get("year") if existing else None,
                "media": media,
                "thumbnail": thumbnail,
                "animatedImage": bool(animated and media[0]["type"] == "image"),
                "provenance": {
                    "chain": "base",
                    "contract": MUSE_CONTRACT.lower(),
                    "tokenId": str(token_id),
                    "url": f"https://base.blockscout.com/token/{MUSE_CONTRACT.lower()}/instance/{token_id}",
                },
                "_meta_uri": uri,
            }
            if existing:
                for key in ("width", "height"):
                    if key in existing:
                        work[key] = existing[key]
                # drop helper
                works[works.index(existing)] = {
                    k: v for k, v in work.items() if not k.startswith("_")
                }
            else:
                works.append({k: v for k, v in work.items() if not k.startswith("_")})
                log(f"muse #{token_id:02d} NEW entry {title}")
        except Exception as exc:  # noqa: BLE001
            log(f"muse #{token_id:02d} FAIL {exc}")
        time.sleep(0.2)


def main() -> None:
    LOG_PATH.write_text("")
    works = json.loads(ARTWORKS.read_text())
    log("=== Calligra Pics ===")
    archive_calligra(works)
    log("=== Muse Editions ===")
    archive_muse(works)
    ARTWORKS.write_text(json.dumps(works, ensure_ascii=False, indent=2) + "\n")
    calligra = sum(1 for w in works if w["series"] == "calligra-pics")
    muse = sum(1 for w in works if w["series"] == "muse-editions")
    log(f"DONE calligra={calligra} muse={muse} total={len(works)}")


if __name__ == "__main__":
    main()
