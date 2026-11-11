import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { artworks, series, findSeries } from "@/lib/artworks";

import { ArchiveGrid } from "@/components/ArchiveGrid";
import { CalligraGrid } from "@/components/CalligraGrid";
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
export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const item = findSeries((await params).slug);
  if (!item) notFound();
  const items = artworks
    .filter((work) => work.series === item.slug)
    .sort((a, b) =>
      item.slug === "100-days-of-blender"
        ? Number(b.slug.split("-")[1]) - Number(a.slug.split("-")[1])
        : item.slug === "calligra-pics" || item.slug === "muse-editions"
          ? Number(a.slug.split("-").pop()) - Number(b.slug.split("-").pop())
          : 0,
    )
    .map(({ description, source, provenance, ...work }) => ({
      ...work,
      seriesName: item.name,
    }));
  return (
    <main tabIndex={-1} id="main" className="site-shell">
      <header className="page-heading">
        <h1 id="series-title">{item.name}</h1>
        <p>{item.description}</p>
      </header>
      <div className="series-return">
        <Link href="/archive">← Collections</Link>
      </div>
      {item.slug === "calligra-pics" ? (
        <CalligraGrid labelledBy="series-title" />
      ) : (
        <ArchiveGrid key={item.slug} items={items} hideSeries />
      )}
    </main>
  );
}
