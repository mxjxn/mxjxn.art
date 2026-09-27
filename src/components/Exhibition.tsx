"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
const selection = [
  {
    slug: "muse-editions-30",
    title: "Phoenix Lens",
    series: "Muse Editions",
    image: "/posters/phoenix-lens.jpg",
    video: "/muse-editions/phoenixlens.mp4",
    fit: "contain",
  },
  {
    slug: "daily-48",
    title: "Day 48",
    series: "Render till December · 2026",
    image: "/daily/day-48.jpg",
    fit: "cover",
  },
  {
    slug: "daily-50",
    title: "Day 50",
    series: "Render till December · 2026",
    image: "/daily/day-50.jpg",
    fit: "contain",
  },
];
export function Exhibition() {
  const [active, setActive] = useState(0),
    [pending, setPending] = useState<number | null>(null),
    [ready, setReady] = useState<number[]>([]);
  const [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(true),
    [requested, setRequested] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const move = (direction: number) => {
    const next =
      ((pending ?? active) + direction + selection.length) % selection.length;
    if (ready.includes(next)) {
      setActive(next);
      setPending(null);
    } else setPending(next);
  };
  useEffect(() => {
    if (pending !== null && ready.includes(pending)) {
      setActive(pending);
      setPending(null);
    }
  }, [ready, pending]);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const sync = () => {
      if (
        selection[active].video &&
        !paused &&
        (!reduced || requested) &&
        !document.hidden
      )
        void element.play().catch(() => setPaused(true));
      else element.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      element.pause();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [active, paused, reduced, requested]);
  useEffect(() => {
    if (paused || (reduced && !requested) || pending !== null) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const next = (active + 1) % selection.length;
      if (ready.includes(next)) setActive(next);
      else setPending(next);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [active, paused, reduced, requested, pending, ready]);
  const current = selection[active];
  return (
    <section
      className="exhibition"
      aria-label="Selected artworks"
      aria-roledescription="carousel"
      aria-busy={pending !== null}
    >
      {selection.map((work, index) => (
        <div
          className={`exhibition-frame ${active === index ? "is-active" : ""}`}
          key={work.slug}
          aria-hidden={active !== index}
        >
          <Image
            src={work.image}
            alt={`${work.title}, by Max Jackson`}
            fill
            sizes={
              work.fit === "cover"
                ? "(max-aspect-ratio: 16/9) 178svh, 100vw"
                : "100vw"
            }
            priority={index === 0}
            loading={index === 0 ? undefined : "eager"}
            quality={90}
            style={{ objectFit: work.fit as "cover" | "contain" }}
            onLoad={() =>
              setReady((values) =>
                values.includes(index) ? values : [...values, index],
              )
            }
            onError={() => {
              setReady((values) =>
                values.includes(index) ? values : [...values, index],
              );
            }}
          />
          {work.video && (
            <video
              ref={video}
              src={active === index ? work.video : undefined}
              poster={work.image}
              muted
              playsInline
              loop
              preload="none"
              style={{ objectFit: "contain" }}
              onError={() => setPaused(true)}
              aria-label={work.title}
            />
          )}
        </div>
      ))}
      <div
        className="exhibition-caption"
        key={current.slug}
        aria-live={paused || reduced ? "polite" : "off"}
      >
        <p>Max Jackson</p>
        <h1>
          <Link href={`/art/${current.slug}`}>
            {current.title}
            <span aria-hidden="true"> ↗</span>
          </Link>
        </h1>
        <p>{current.series}</p>
      </div>
      <div className="exhibition-controls">
        <Link className="explore-work" href="#practice">
          Scroll to explore ↓
        </Link>
        <span
          className="exhibition-count"
          aria-label={`Artwork ${active + 1} of ${selection.length}`}
        >
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(selection.length).padStart(2, "0")}
        </span>
        <button
          className="motion-control"
          onClick={() => {
            setPaused(!(paused || (reduced && !requested)));
            setRequested(true);
          }}
        >
          {paused || (reduced && !requested)
            ? "Play slideshow"
            : "Pause slideshow"}
        </button>
        <button onClick={() => move(-1)} aria-label="Previous selected artwork">
          ←
        </button>
        <button onClick={() => move(1)} aria-label="Next selected artwork">
          →
        </button>
      </div>
    </section>
  );
}
