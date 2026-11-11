# 100 Days of Blender — missing days

Status as of 2026-11-11. Catalog has **95 / 100** days. Goal: import the nine gaps below so the series is complete.

## Missing from `artworks.json`

| Day | Title | In Hypersnap? | On disk (`~/blender`)? | Action |
|-----|--------|---------------|-------------------------|--------|
| 41 | Day 41 | No labeled cast between Day 40 (Sep 5) and Day 42 (Sep 6) | `41.blend` (+ `.blend1`) only — **no final still/mp4** | Render a still/video from the blend, then import |
| 69 | Day 69 | **Yes — matcher missed it.** Cast text was `"69 i got in over my head"` (no Day/Daily prefix) | `69-nice/psychedelic-star-gates-loop.mp4` + frame PNGs + `Untitled.png` | Import local video (+ Hypersnap stills). Cast: https://farcaster.xyz/mxjxn/8b53cb4993ee85fcd68c4afccc734c117582f9e9 |
| 81 | Day 81 | No labeled cast between Day 80 (Oct 14) and Day 83 (Oct 18) | `81.blend`, **`81.png`** (1080×1920) | Import `81.png` |
| 82 | Day 82 | Same gap as 81 | `82.blend`, **`82.0.png` / `82.1.png` / `82.2.png`** | Import preferred still (likely `82.0` or `82.2`) |
| 84 | Day 84 | No labeled cast between Day 83 (Oct 18) and Day 86 (Oct 21) | **`84.png`** (1920×1080) — no `.blend` | Import `84.png` |
| 85 | Day 85 | Mentioned only as *“Day 85 is only posted to X”* inside the Day 86 cast | **`renders/85tunnel.mp4`** | Import local mp4; optionally pull X original later |
| 93 | Day 93 | No labeled cast between Day 92 (Oct 27) and Day 94 (Oct 29) | **Nothing dedicated** | Search X / re-export / skip with note |
| 97 | Day 97 | No numbered cast; unlabeled candidate exists | `97.blend`, **`97/97.gif`**, `97/970001-0072.mp4` | Import gif or mp4. Possible FC match: https://farcaster.xyz/mxjxn/d9c7acc90c8415275c72639d5703697b8a608612 (`It's what it says #blender3d`, Nov 1) — confirm if this is 97 or 98 |
| 98 | Day 98 | Same as 97 | **Nothing dedicated** | Confirm Nov 1 cast, or search X / re-export |

## Hypersnap context

- Dump: `scripts/hypersnap-mxjxn-casts-120d.json` (FID 4905, ~2017 casts, cutoff ≈ 2026-07-14 → 2026-11-11)
- Summary: `scripts/hypersnap-100days-summary.json` — `by_day` has **90** numbered mappings; `missing_days` listed `[1, 32, 41, 69, 81, 82, 84, 93, 97, 98]`
- Days **1** and **32** are already in the catalog (imported via other paths); the live gaps are the nine above
- Import matcher required Day/Daily-style prefixes, so **Day 69 was in the dump but skipped**

### Neighbor timeline (mapped casts)

| Day | Timestamp | Snippet |
|-----|-----------|---------|
| 40 | 2026-09-05 | Day 40 rendering something in blender |
| 42 | 2026-09-06 | Day 42 rendered in blender… |
| 68 | 2026-10-03 | blender daily 68 |
| 70 | 2026-10-05 | Daily Render 70 |
| 80 | 2026-10-14 | Warp Drive - Daily render #80 |
| 83 | 2026-10-18 | day 83 |
| 86 | 2026-10-21 | Day 86… Day 85 is only posted to X |
| 92 | 2026-10-27 | Blender daily #92 |
| 94 | 2026-10-29 | Blender daily 94 |
| 96 | 2026-10-30 | Blender Daily 96 |
| 99 | 2026-11-03 | daily render 99/100 |
| 100 | 2026-11-04 | Daily Render Day 100 of 100 |

## Local paths to prefer (absolute)

```
/home/mxjxn/blender/41.blend
/home/mxjxn/blender/69-nice/psychedelic-star-gates-loop.mp4
/home/mxjxn/blender/69-nice/Untitled.png
/home/mxjxn/blender/81.png
/home/mxjxn/blender/82.0.png
/home/mxjxn/blender/82.1.png
/home/mxjxn/blender/82.2.png
/home/mxjxn/blender/84.png
/home/mxjxn/blender/renders/85tunnel.mp4
/home/mxjxn/blender/97/97.gif
/home/mxjxn/blender/97/970001-0072.mp4
```

Ignore frame-sequence false positives like `33/0041.png`, `day10/render/frame_0069.png`, etc. — those are frames *from other days’ animations*, not Day N masters.

## Suggested import recipe (for a later agent)

1. Copy masters into the site media tree (or upload straight to Vercel Blob), e.g. `public/daily/day-NN.*` and `public/posters/daily-NN.jpg` as used by existing entries.
2. Add `artworks.json` entries shaped like neighbors (`slug: daily-NN`, `series: 100-days-of-blender`, `title: Day NN`, media image/video/hls, thumbnail).
3. For Day 69, also wire the Hypersnap cast URL / imagedelivery embeds if useful for provenance.
4. For Day 41: open `41.blend`, export a poster (and video if animated), then import.
5. For 93 / 98: do not invent media — leave missing until X or a confirmed local file is found.
6. Re-run / extend Blob upload (`scripts/upload-media-to-blob.mjs`) for any new `public/daily` / `public/posters` files.
7. Keep `.vercelignore` excluding those heavy paths so CLI deploys stay lean.

## Related site behavior (already shipped)

- Series page: `/series/100-days-of-blender` — scroll-loads grid; hover warms HLS
- Homepage Calligra mosaic is separate; 100 Days home selection is still a curated subset
- Demoted AI NFT series remain in JSON but hidden from public portfolio via `demotedSeries` in `src/lib/artworks.ts`
