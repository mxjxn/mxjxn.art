"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArtworkImage } from "./ArtworkImage";
import { ArtworkVideo } from "./ArtworkVideo";
import { type Artwork, publicUrl } from "@/lib/artworks";
export function SelectedArtwork({
  work,
  seriesName,
  position,
}: {
  work: Artwork;
  seriesName: string;
  position: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [pageHidden, setPageHidden] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visited, setVisited] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const visibility = () => setPageHidden(document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setVisited(true);
      },
      { threshold: 0.15 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      observer.disconnect();
      query.removeEventListener("change", sync);
    };
  }, []);
  const film = work.media.find(
    (m) => (m.type === "video" || m.type === "hls") && !m.unavailable,
  );
  const poster = work.thumbnail || work.media[0].poster;
  return (
    <figure ref={ref} className={`selected-piece selected-${position}`}>
      <Link
        href={`/art/${work.slug}`}
        className="selected-stage"
        aria-label={`View ${work.title}`}
      >
        {poster && (
          <ArtworkImage
            src={publicUrl(poster)}
            title={work.title}
            priority={position === "opening"}
            natural
            width={work.width}
            height={work.height}
            animated={work.animatedImage}
            sizes="(max-width: 700px) 90vw, 70vw"
          />
        )}
        {film && visited && (
          <ArtworkVideo
            src={publicUrl(film.src)}
            title={work.title}
            motionPreview
            preview
            active={visible && !paused && !reduced && !pageHidden}
          />
        )}
      </Link>
      <figcaption>
        <div>
          <Link href={`/art/${work.slug}`}>
            {work.title} <span aria-hidden="true">↗</span>
          </Link>
          <p>
            {seriesName}
            {work.year ? ` · ${work.year}` : ""}
          </p>
        </div>
        {film && (
          <button
            onClick={() => {
              if (reduced) {
                setReduced(false);
                setPaused(false);
              } else setPaused(!paused);
            }}
          >
            {paused || reduced ? "Play motion" : "Pause motion"}
          </button>
        )}
      </figcaption>
    </figure>
  );
}
