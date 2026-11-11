import data from "@/data/artworks.json";
import respiration from "@/data/respiration.json";
export type Media = {
  type: "image" | "video" | "hls" | "interactive" | "model";
  src: string;
  poster?: string | null;
  unavailable?: boolean;
};
export type Artwork = {
  slug: string;
  title: string;
  series: string;
  description: string;
  year: number | null;
  media: Media[];
  thumbnail: string | null;
  width?: number;
  height?: number;
  animatedImage: boolean;
  source?: string;
  provenance?: {
    chain: string;
    contract: string;
    tokenId: string;
    url: string;
  };
};
export const artworks = [respiration, ...data] as Artwork[];

/** Series kept out of the public portfolio (wallet-scrape / AI NFT experiments). Data remains in artworks.json. */
export const demotedSeries = [
  "degen-ghouls",
  "degen-cats",
  "ethereal-realms",
  "hyper-ghouls",
] as const;
export type DemotedSeries = (typeof demotedSeries)[number];
export const isDemotedSeries = (slug: string): slug is DemotedSeries =>
  (demotedSeries as readonly string[]).includes(slug);

export const series = [
  {
    slug: "the-process-of-exploration",
    name: "The Process of Exploration",
    description: "Works from an ongoing practice of digital exploration.",
  },
  {
    slug: "100-days-of-blender",
    name: "100 Days of Blender",
    description:
      "A completed daily practice in Blender: one hundred days of calligraphy, geometry, materials, and motion.",
  },
  {
    slug: "muse-editions",
    name: "Muse Editions",
    description:
      "Weekly editions from Muse Studio—calligraphic forms, generative processes, imagined spaces, and moving image.",
  },
  {
    slug: "meditative-blackletter",
    name: "Meditative Blackletter",
    description:
      "Calligraphic compositions made with parallel pens and watercolor inks on paper.",
  },
  {
    slug: "reaching-the-source",
    name: "Reaching the Source",
    description:
      "Early experiments with AI, from 2021. A GAN trained on roughly 100 of my calligraphic, 3D, and glitch artworks; the results curated and manipulated into new works.",
  },
  {
    slug: "calligra-pics",
    name: "Calligra Pics",
    description:
      "One hundred calligraphic abstracts made in the summer of 2021—my first out collection on Ethereum.",
  },
];

export const publicArtworks = artworks.filter(
  (work) => !isDemotedSeries(work.series),
);

export const findArtwork = (slug: string) =>
  artworks.find((work) => work.slug === slug);
export const findSeries = (slug: string) =>
  series.find((item) => item.slug === slug);
/** Local public paths that are served from Vercel Blob in production. */
const BLOB_PREFIXES = [
  "/calligrapics/",
  "/muse-editions/",
  "/daily/",
  "/posters/",
  "/meditations/",
  "/wheelgen/poster.png",
  "/srclensx.jpg",
  "/srclensz.jpg",
  "/source.jpg",
  "/evolution.jpg",
  "/phoenix.gif",
  "/muse-patron.gif",
  "/muse-pass.png",
];

function isBlobBackedPath(src: string) {
  return BLOB_PREFIXES.some(
    (prefix) => src === prefix || src.startsWith(prefix),
  );
}

/**
 * Resolve a media src for display.
 * - ipfs:// → gateway
 * - http(s) → unchanged
 * - blob-backed local paths → NEXT_PUBLIC_MEDIA_BASE_URL + path (when set)
 * - otherwise local /public path
 */
export function publicUrl(src: string) {
  if (src.startsWith("ipfs://")) {
    return (
      "https://ipfs.io/ipfs/" + src.slice(7).replace(/^ipfs\//, "")
    );
  }
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/$/, "");
  if (base && isBlobBackedPath(src)) {
    // Blob pathnames have no leading slash; catalog paths do.
    return `${base}/${src.replace(/^\//, "")}`;
  }
  return src;
}
