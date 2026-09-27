"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArtworkImage } from "./ArtworkImage";
import { ArtworkVideo } from "./ArtworkVideo";
import { type Artwork, publicUrl } from "@/lib/artworks";
export function CollectionExhibition({
  slug,
  name,
  description,
  works,
  index,
}: {
  slug: string;
  name: string;
  description: string;
  works: Artwork[];
  index: number;
}) {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0),
    [visible, setVisible] = useState(false),
    [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(true),
    [hidden, setHidden] = useState(false),
    [focused, setFocused] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    const visibility = () => setHidden(document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    if (section.current) observer.observe(section.current);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const running = visible && !paused && !reduced && !hidden && !focused;
  useEffect(() => {
    if (!running || works.length < 2) return;
    const timer = setInterval(
      () => setActive((i) => (i + 1) % works.length),
      8000,
    );
    return () => clearInterval(timer);
  }, [running, active, works.length]);
  const work = works[active];
  if (!work) return null;
  const film = work.media.find(
    (m) => !m.unavailable && (m.type === "video" || m.type === "hls"),
  );
  const move = (direction: number) => {
    setPaused(true);
    setActive((i) => (i + direction + works.length) % works.length);
  };
  return (
    <section
      ref={section}
      className={`collection-scene ${index % 2 ? "collection-scene-reverse" : ""}`}
      aria-labelledby={`collection-${slug}`}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <div className="collection-scene-media">
        <div className="collection-scene-stage" key={work.slug}>
          <ArtworkImage
            src={publicUrl(
              work.thumbnail || work.media[0].poster || work.media[0].src,
            )}
            title={`${name}: ${work.title}`}
            sizes="(max-width:800px) 92vw, 58vw"
          />
          {film && visible && (
            <ArtworkVideo
              src={publicUrl(film.src)}
              title={work.title}
              motionPreview
              preview
              active={running}
            />
          )}
        </div>
        <div className="collection-scene-controls">
          <span aria-live={running ? "off" : "polite"}>
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(works.length).padStart(2, "0")}
          </span>
          {(works.length > 1 || film) && (
            <button
              onClick={() => {
                setPaused(!paused && !reduced);
                if (reduced) setReduced(false);
              }}
              aria-label={`${paused || reduced ? "Play" : "Pause"} ${name} slideshow`}
            >
              {paused || reduced ? "Play" : "Pause"}
            </button>
          )}
          {works.length > 1 && (
            <>
              <button
                onClick={() => move(-1)}
                aria-label={`Previous image in ${name}`}
              >
                ←
              </button>
              <button
                onClick={() => move(1)}
                aria-label={`Next image in ${name}`}
              >
                →
              </button>
            </>
          )}
        </div>
      </div>
      <div className="collection-scene-copy">
        <p className="section-label">
          Collection {String(index + 1).padStart(2, "0")}
        </p>
        <h2 id={`collection-${slug}`}>{name}</h2>
        <p>{description}</p>
        <Link className="text-link" href={`/series/${slug}`}>
          Explore the collection ↗
        </Link>
      </div>
    </section>
  );
}
