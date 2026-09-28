import type { Metadata } from "next";
import Link from "next/link";
import { ArtworkMedia } from "@/components/ArtworkMedia";
import { CollectAuction } from "@/components/CollectAuction";
import { findArtwork } from "@/lib/artworks";
import { SALE } from "@/lib/auction-contract";
export const metadata: Metadata = {
  title: "Collect Respiration",
  description:
    "Respiration, a moving-image artwork by Max Jackson. View the work and its live Ethereum auction.",
};
export default function CollectPage() {
  const work = findArtwork("respiration")!;
  return (
    <main tabIndex={-1} id="main" className="site-shell collect-page">
      <div className="collect-art" aria-label="Respiration — film">
        <ArtworkMedia work={work} />
      </div>
      <div className="collect-caption">
        <span>Respiration · 2026</span>
        <a href="#collect-details">
          About the work & collect <span aria-hidden="true">↓</span>
        </a>
      </div>
      <div className="collect-layout" id="collect-details">
        <section className="collect-info" aria-label="About the artwork">
          <p className="sale-eyebrow">Max Jackson · 2026</p>
          <h1>Respiration</h1>
          <p className="collect-series">The Process of Exploration</p>
          <p className="collect-description">{work.description}</p>
          <p className="sale-caption">25-second film · 1080 × 1080</p>
          <details className="sale-provenance">
            <summary>Provenance & details</summary>
            <p>Ethereum · ERC-721 · Token 1</p>
            <a
              href={work.provenance!.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Artwork contract ↗
            </a>
            <a
              href={`https://etherscan.io/address/${SALE.marketplace}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Auction contract ↗
            </a>
            <a href={SALE.source} target="_blank" rel="noopener noreferrer">
              Original listing ↗
            </a>
            <Link href="/art/daily-8">From the daily practice →</Link>
          </details>
        </section>
        <aside
          className="collect-auction-area"
          aria-label="Collect Respiration"
        >
          <CollectAuction />
        </aside>
      </div>
    </main>
  );
}
