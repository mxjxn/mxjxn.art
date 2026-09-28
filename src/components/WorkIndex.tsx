"use client";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { ArchiveItem } from "./ArchiveGrid";
import { ArtworkImage } from "./ArtworkImage";
import { publicUrl } from "@/lib/artworks";
type Entry = ArchiveItem & { href?: string };
function Filmstrip({
  items,
  title,
  year,
}: {
  items: Entry[];
  title: string;
  year: number | null;
}) {
  const strip = useRef<HTMLDivElement>(null);
  return (
    <section className="archive-band">
      <header className="archive-band-heading">
        <div>
          <h2>{title}</h2>
          <span>
            {year || "Date unverified"} · {items.length}{" "}
            {items.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        <div className="band-controls" hidden={items.length < 2}>
          <button
            aria-label={`Previous ${title} artworks`}
            onClick={() =>
              strip.current?.scrollBy({
                left: -strip.current.clientWidth * 0.8,
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            ←
          </button>
          <button
            aria-label={`Next ${title} artworks`}
            onClick={() =>
              strip.current?.scrollBy({
                left: strip.current.clientWidth * 0.8,
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            →
          </button>
        </div>
      </header>
      <div
        className="archive-filmstrip"
        ref={strip}
        tabIndex={0}
        aria-label={`${title} artworks; scroll horizontally`}
      >
        {items.map((w) => (
          <Link
            key={w.slug}
            href={w.href || `/art/${w.slug}`}
            className="archive-frame"
            style={{
              width: `calc(var(--archive-height) * ${Math.max(0.5, Math.min(2.4, (w.width || 1200) / (w.height || 1200)))})`,
            }}
          >
            <div className="archive-frame-image">
              {w.thumbnail ? (
                <ArtworkImage
                  src={publicUrl(w.thumbnail)}
                  title={w.title}
                  sizes="240px"
                  animated={w.animatedImage}
                />
              ) : (
                <span>View artwork ↗</span>
              )}
            </div>
            <span className="archive-frame-title">
              {w.title}
              {w.media.some((m) => m.type === "video" || m.type === "hls") && (
                <span aria-label="Video"> ▷</span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
export function WorkIndex({ items }: { items: Entry[] }) {
  const [query, setQuery] = useState("");
  const [series, setSeries] = useState("");
  const options = useMemo(
    () => Array.from(new Set(items.map((w) => w.seriesName))),
    [items],
  );
  const filtered = items.filter(
    (w) =>
      (!series || w.seriesName === series) &&
      `${w.title} ${w.seriesName}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  const groups = new Map<
    string,
    { title: string; year: number | null; items: Entry[] }
  >();
  for (const work of filtered) {
    const key = `${work.year}-${work.seriesName}`;
    if (!groups.has(key))
      groups.set(key, { title: work.seriesName, year: work.year, items: [] });
    groups.get(key)!.items.push(work);
  }
  const ordered = [...groups.values()].sort(
    (a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title),
  );
  for (const group of ordered)
    group.items.sort((a, b) =>
      a.series === "render-till-december" && b.series === a.series
        ? Number(b.slug.split("-")[1]) - Number(a.slug.split("-")[1])
        : Number(!!b.thumbnail?.startsWith("/")) -
            Number(!!a.thumbnail?.startsWith("/")) ||
          a.title.localeCompare(b.title, undefined, { numeric: true }),
    );
  return (
    <div className="visual-archive">
      <div className="archive-tools">
        <label>
          <span className="visually-hidden">Find an artwork</span>
          <input
            type="search"
            placeholder="Find an artwork…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          <span className="visually-hidden">Filter by series</span>
          <select value={series} onChange={(e) => setSeries(e.target.value)}>
            <option value="">All series</option>
            {options.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <span aria-live="polite">{filtered.length} entries</span>
      </div>
      <p className="archive-order">
        Newest dated series first · Swipe or scroll to explore each series
      </p>
      {ordered.map((group) => (
        <Filmstrip key={`${group.year}-${group.title}`} {...group} />
      ))}
      {!filtered.length && (
        <p className="empty-state">
          No works found. Try another title or series.
        </p>
      )}
    </div>
  );
}
