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
export const series = [
  {
    slug: "the-process-of-exploration",
    name: "The Process of Exploration",
    description: "Works from an ongoing practice of digital exploration.",
  },
  {
    slug: "render-till-december",
    name: "Render till December",
    description:
      "An ongoing daily practice in Blender. Experiments with calligraphy, geometry, materials, and motion.",
  },
  {
    slug: "muse-editions",
    name: "Muse Editions",
    description:
      "An evolving collection of digital works, moving between calligraphic forms, generative processes, and imagined spaces.",
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
      "A selection from 100 calligraphic abstracts made in the summer of 2021.",
  },
  {
    slug: "degen-ghouls",
    name: "DegenGhouls",
    description:
      "A cast of imagined characters, created with generative image tools.",
  },
  {
    slug: "degen-cats",
    name: "DegenCats",
    description: "An exploration of character and digital image making.",
  },
  {
    slug: "ethereal-realms",
    name: "Ethereal Realms",
    description: "Imagined worlds, made with generative image tools.",
  },
  {
    slug: "hyper-ghouls",
    name: "Hyper Ghouls",
    description: "An exploration of uncanny characters and imagined forms.",
  },
];
export const findArtwork = (slug: string) =>
  artworks.find((work) => work.slug === slug);
export const findSeries = (slug: string) =>
  series.find((item) => item.slug === slug);
export function publicUrl(src: string) {
  return src.startsWith("ipfs://")
    ? "https://ipfs.io/ipfs/" + src.slice(7).replace(/^ipfs\//, "")
    : src;
}

// These projects are presented as collections, never as individual portfolio entries.
export const collectionOnly = {
  "degen-ghouls": "degen-ghouls-99",
  "degen-cats": "degen-cats-44",
} as const;
export const isCollectionOnly = (
  slug: string,
): slug is keyof typeof collectionOnly =>
  Object.prototype.hasOwnProperty.call(collectionOnly, slug);
