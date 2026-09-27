import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  artworks,
  findArtwork,
  findSeries,
  isCollectionOnly,
} from "@/lib/artworks";
import { ArtworkMedia } from "@/components/ArtworkMedia";
export function generateStaticParams() {
  return artworks.map((work) => ({ slug: work.slug }));
}
export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const work = findArtwork(params.slug);
  if (work && isCollectionOnly(work.series))
    return {
      title: findSeries(work.series)?.name,
      alternates: { canonical: `/series/${work.series}` },
    };
  return work
    ? {
        title: work.title,
        description:
          work.description.slice(0, 160) ||
          `${work.title}, an artwork by Max Jackson.`,
      }
    : {};
}
export default function ArtworkPage({ params }: { params: { slug: string } }) {
  const work = findArtwork(params.slug);
  if (!work) notFound();
  if (isCollectionOnly(work.series))
    permanentRedirect(`/series/${work.series}`);
  const collection = findSeries(work.series),
    siblings = artworks.filter((item) => item.series === work.series),
    index = siblings.indexOf(work);
  const previous = siblings[index - 1],
    next = siblings[index + 1];
  return (
    <main tabIndex={-1} id="main" className="site-shell">
      <div className="artwork-top">
        <Link href={`/series/${work.series}`}>← {collection?.name}</Link>
        <span>Max Jackson</span>
      </div>
      <ArtworkMedia work={work} />
      <div className="artwork-info">
        <div>
          <Link href={`/series/${work.series}`} className="section-label">
            {collection?.name}
          </Link>
          <h1>{work.title}</h1>
          {work.year && <p className="artwork-year">{work.year}</p>}
        </div>
        <div>
          <p className="artist-description">{work.description}</p>
          {(work.slug === "respiration" || work.slug === "daily-8") && (
            <Link className="text-link artwork-sale-link" href="/collect">
              Respiration · View auction →
            </Link>
          )}
          {work.provenance && (
            <details className="provenance">
              <summary>Onchain record</summary>
              <p>
                {work.provenance.chain === "base" ? "Base" : "Ethereum"} · Token{" "}
                {work.provenance.tokenId}
              </p>
              <p>{work.provenance.contract}</p>
              <a
                href={work.provenance.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View provenance ↗
              </a>
            </details>
          )}
        </div>
      </div>
      <nav className="artwork-siblings" aria-label="More from this series">
        <div>
          {previous && (
            <Link href={`/art/${previous.slug}`}>
              <span>Previous work</span>← {previous.title}
            </Link>
          )}
        </div>
        {next && (
          <Link href={`/art/${next.slug}`}>
            <span>Next work</span>
            {next.title} →
          </Link>
        )}
      </nav>
    </main>
  );
}
