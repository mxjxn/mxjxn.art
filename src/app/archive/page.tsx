import type { Metadata } from "next";
import { artworks, series, findArtwork } from "@/lib/artworks";
import { CollectionExhibition } from "@/components/CollectionExhibition";
export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore the collections and ongoing art practice of Max Jackson.",
};
const picks: Record<string, string[]> = {
  "render-till-december": ["daily-60", "daily-48", "daily-50", "daily-59"],
  "muse-editions": ["muse-editions-30", "muse-editions-31", "muse-editions-29"],
  "meditative-blackletter": [
    "meditative-blackletter-6",
    "meditative-blackletter-1",
    "meditative-blackletter-2",
  ],
  "reaching-the-source": [
    "reaching-the-source-47",
    "reaching-the-source-49",
    "reaching-the-source-60",
  ],
  "calligra-pics": ["calligra-pic-58", "calligra-pic-74", "calligra-pic-95"],
  "degen-ghouls": ["degen-ghouls-99"],
  "degen-cats": ["degen-cats-44"],
};
const order = [
  "render-till-december",
  "muse-editions",
  "meditative-blackletter",
  "reaching-the-source",
  "the-process-of-exploration",
  "calligra-pics",
  "ethereal-realms",
  "hyper-ghouls",
  "degen-ghouls",
  "degen-cats",
];
export default function Archive() {
  return (
    <main tabIndex={-1} id="main" className="site-shell collection-exhibition">
      <header className="collection-intro">
        <h1>Collections</h1>
        <p>
          Calligraphic forms, imagined spaces,
          <br />
          and an ongoing practice of exploration.
        </p>
      </header>
      {order.map((slug, index) => {
        const item = series.find((s) => s.slug === slug)!;
        const works = picks[slug]
          ? picks[slug]
              .map(findArtwork)
              .filter((w): w is NonNullable<typeof w> => !!w)
          : artworks.filter((w) => w.series === slug).slice(0, 3);
        return (
          <CollectionExhibition
            key={slug}
            {...item}
            works={works}
            index={index}
          />
        );
      })}
    </main>
  );
}
