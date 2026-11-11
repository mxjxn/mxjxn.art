"use client";
import Link from "next/link";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Artwork } from "@/lib/artworks";
import { publicUrl } from "@/lib/artworks";
import { ArtworkImage } from "./ArtworkImage";
import { ArtworkVideo } from "./ArtworkVideo";

export type ArchiveItem = Pick<
  Artwork,
  | "slug"
  | "title"
  | "series"
  | "thumbnail"
  | "animatedImage"
  | "year"
  | "media"
  | "width"
  | "height"
> & { seriesName: string };

const PAGE = 24;

export function ArchiveArtwork({ work }: { work: ArchiveItem }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [near, setNear] = useState(false);
  const [playback, setPlayback] = useState<"loading" | "playing" | "failed">(
    "loading",
  );
  const [progress, setProgress] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const active = hovered || focused;

  const film = work.media.find(
    (media) =>
      !media.unavailable && (media.type === "video" || media.type === "hls"),
  );

  useEffect(() => {
    if (!film) return;
    const node = cardRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "280px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [film]);

  const allowMotion = () =>
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <Link
      href={`/art/${work.slug}`}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible") && allowMotion())
          setFocused(true);
      }}
      onBlur={() => setFocused(false)}
    >
      <div
        ref={cardRef}
        className="archive-artwork"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" && allowMotion()) setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
      >
        {work.thumbnail ? (
          <ArtworkImage
            src={publicUrl(work.thumbnail)}
            title={work.title}
            animated={work.animatedImage}
            natural
            width={work.width}
            height={work.height}
            sizes="(max-width:600px) 92vw, (max-width:900px) 45vw, 320px"
          />
        ) : (
          <div
            className="art-image natural-video"
            style={{
              aspectRatio: (work.width || 1600) / (work.height || 1200),
            }}
          >
            <ArtworkVideo
              src={publicUrl(work.media[0].src)}
              title={work.title}
              preview
              onPreviewLoaded={() => setHasLoaded(true)}
            />
          </div>
        )}
        {film && near && (
          <ArtworkVideo
            src={publicUrl(film.src)}
            title={work.title}
            preview
            motionPreview
            active={active}
            onPreviewState={setPlayback}
            onPreviewProgress={setProgress}
            onPreviewLoaded={() => setHasLoaded(true)}
          />
        )}
      </div>
      <h3 className="work-title">
        {work.title}
        {film && (
          <>
            <span className="visually-hidden"> — Video</span>
            <span className="preview-indicator" aria-hidden="true">
              {active && playback === "playing" ? (
                <span className="preview-timeline">
                  <span style={{ transform: `scaleX(${progress})` }} />
                </span>
              ) : active && playback === "loading" ? (
                <span className="preview-spinner" />
              ) : (
                <svg
                  className="preview-play"
                  viewBox="0 0 16 16"
                  fill={hasLoaded ? "currentColor" : "none"}
                >
                  <path
                    d="M5 3.5 12 8l-7 4.5Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          </>
        )}
      </h3>
    </Link>
  );
}

export function ArchiveGrid({
  items,
  hideSeries = false,
  showAll = false,
}: {
  items: ArchiveItem[];
  hideSeries?: boolean;
  showAll?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(showAll ? items.length : PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () =>
      items.filter((work) =>
        `${work.title} ${work.seriesName}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
      ),
    [items, query],
  );

  useEffect(() => {
    if (showAll) return;
    const node = sentinelRef.current;
    if (!node || limit >= visible.length) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting)
          setLimit((n) => Math.min(n + PAGE, visible.length));
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [limit, visible.length, showAll]);

  return (
    <>
      <div className="archive-toolbar">
        <label>
          <span className="visually-hidden">Find an artwork</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setLimit(showAll ? items.length : PAGE);
            }}
            placeholder="Find an artwork…"
          />
        </label>
        <p aria-live="polite">
          {visible.length} {visible.length === 1 ? "work" : "works"}
        </p>
      </div>
      <div className="archive-grid">
        {visible.slice(0, showAll ? visible.length : limit).map((work) => (
          <article
            key={work.slug}
            className="work-card"
            style={
              {
                "--ratio": (work.width || 1600) / (work.height || 1200),
              } as CSSProperties
            }
          >
            <ArchiveArtwork work={work} />
            {!hideSeries && (
              <p>
                {work.seriesName}
                {work.year ? ` · ${work.year}` : ""}
              </p>
            )}
          </article>
        ))}
      </div>
      {!visible.length && (
        <p className="empty-state">
          No works found. Try a different title or series.
        </p>
      )}
      {!showAll && limit < visible.length && (
        <div
          ref={sentinelRef}
          className="load-more-sentinel"
          aria-hidden="true"
        />
      )}
    </>
  );
}
