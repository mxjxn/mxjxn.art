import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  artworks,
  series,
  findSeries,
  findArtwork,
  collectionOnly,
  isCollectionOnly,
  publicUrl,
} from "@/lib/artworks";

import { ArtworkImage } from "@/components/ArtworkImage";
import { ArchiveGrid } from "@/components/ArchiveGrid";
export function generateStaticParams() {
  return series.map((item) => ({ slug: item.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const item = findSeries((await params).slug);
  return item ? { title: item.name, description: item.description } : {};
}
export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const item = findSeries((await params).slug);
  if (!item) notFound();
  if (isCollectionOnly(item.slug)) {
    const cover = findArtwork(collectionOnly[item.slug])!;
    return (
      <main tabIndex={-1} id="main" className="site-shell collection-overview">
        <header className="page-heading">
          <p className="section-label">Collection</p>
          <h1>{item.name}</h1>
          <p>{item.description}</p>
        </header>
        <figure className="collection-cover">
          <ArtworkImage
            src={publicUrl(cover.thumbnail!)}
            title={`${item.name} — representative artwork`}
            natural
            width={cover.width}
            height={cover.height}
            priority
          />
          <figcaption>A selection from {item.name}</figcaption>
        </figure>
        <div className="collection-context">
          <p>
            {item.slug === "degen-ghouls"
              ? "A collection of imagined characters exploring uncanny forms and generative image making."
              : "A collection of imagined cats exploring character and generative image making."}
          </p>
          <Link href="/archive">← Collections</Link>
        </div>
      </main>
    );
  }
  const items = artworks
    .filter((work) => work.series === item.slug)
    .sort((a, b) =>
      item.slug === "render-till-december"
        ? Number(b.slug.split("-")[1]) - Number(a.slug.split("-")[1])
        : 0,
    )
    .map(({ description, source, provenance, ...work }) => ({
      ...work,
      seriesName: item.name,
    }));
  return (
    <main tabIndex={-1} id="main" className="site-shell">
      <header className="page-heading">
        <h1>{item.name}</h1>
        <p>{item.description}</p>
      </header>
      <div className="series-return">
        <Link href="/archive">← Collections</Link>
      </div>
      <ArchiveGrid key={item.slug} items={items} hideSeries />
    </main>
  );
}
