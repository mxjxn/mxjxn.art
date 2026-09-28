import type { Metadata } from "next";
import Link from "next/link";
import { findArtwork, findSeries } from "@/lib/artworks";
import { SelectedArtwork } from "@/components/SelectedArtwork";
export const metadata: Metadata = {
  title: "Selected work",
  description:
    "Selected moving images, calligraphic forms, and digital experiments by Max Jackson.",
};
// Provisional curatorial order: change these slugs to reshape the exhibition.
const selection = [
  { slug: "muse-editions-30", position: "opening" },
  { slug: "meditative-blackletter-6", position: "left" },
  { slug: "daily-48", position: "wide" },
  { slug: "reaching-the-source-47", position: "right" },
  { slug: "daily-50", position: "closing" },
];
export default function Work() {
  return (
    <main tabIndex={-1} id="main" className="selected-work site-shell">
      <header className="selected-heading">
        <h1>Selected work</h1>
        <Link href="/archive">Collections ↗</Link>
      </header>
      <div className="selected-sequence">
        {selection.map(({ slug, position }) => {
          const work = findArtwork(slug)!;
          return (
            <SelectedArtwork
              key={slug}
              work={work}
              position={position}
              seriesName={findSeries(work.series)?.name || work.series}
            />
          );
        })}
      </div>
      <section className="practice-entry" aria-labelledby="practice-title">
        <p className="section-label">An ongoing practice</p>
        <Link href="/series/render-till-december">
          <h2 id="practice-title">
            Render till
            <br />
            December <span aria-hidden="true">↗</span>
          </h2>
        </Link>
        <div className="practice-strip">
          {["daily-59", "daily-40", "daily-5"].map((slug) => {
            const work = findArtwork(slug)!;
            return (
              <Link key={slug} href={`/art/${slug}`}>
                <img src={work.thumbnail!} alt={work.title} loading="lazy" />
                <span>{work.title}</span>
              </Link>
            );
          })}
        </div>
        <div className="practice-caption">
          <p>
            One day, another experiment.
            <br />
            An ongoing daily practice in Blender.
          </p>
          <Link href="/series/render-till-december">Enter the series ↗</Link>
        </div>
      </section>
      <nav className="selected-end" aria-label="Explore more">
        <p>There’s more to see.</p>
        <Link href="/archive">Explore all collections ↗</Link>
      </nav>
    </main>
  );
}
