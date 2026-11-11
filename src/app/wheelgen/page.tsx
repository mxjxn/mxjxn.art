import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { findArtwork, publicUrl } from "@/lib/artworks";

export const metadata: Metadata = {
  title: "WheelGen",
  description:
    "An interactive generative artwork by Max Jackson—concentric calligraphic rings driven by a custom grammar. Muse Editions #61.",
  openGraph: {
    title: "WheelGen — MXJXN",
    images: [publicUrl("/wheelgen/poster.png")],
  },
};

export default function WheelGenPage() {
  const work = findArtwork("muse-editions-61");
  return (
    <main tabIndex={-1} id="main" className="wheelgen-page">
      <section className="wheelgen-hero site-shell">
        <div className="wheelgen-copy">
          <p className="section-label">Muse Editions · 61</p>
          <h1>WheelGen</h1>
          <p className="lead">
            A generative studio that turns calligraphic grammar into concentric
            rings. Shape, color, and motion stay under your hand.
          </p>
          <p>
            {work?.description ||
              "Built as an interactive edition—use the controls to generate your own composition from the same formal language as my abstract calligraphy."}
          </p>
          <div className="wheelgen-actions">
            <a className="wheelgen-enter" href="/wheelgen/app/">
              Enter WheelGen <span aria-hidden="true">↗</span>
            </a>
            <Link className="text-link" href="/series/muse-editions">
              Muse Editions
            </Link>
            {work?.provenance && (
              <a
                className="text-link"
                href={work.provenance.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Onchain record ↗
              </a>
            )}
          </div>
        </div>
        <figure className="wheelgen-figure">
          <a
            href="/wheelgen/app/"
            className="wheelgen-poster"
            aria-label="Enter WheelGen"
          >
            <Image
              src={publicUrl("/wheelgen/poster.png")}
              alt="WheelGen — generative calligraphic ring composition"
              fill
              priority
              sizes="(max-width:800px) 92vw, 48vw"
            />
          </a>
          <figcaption>
            Self-hosted interactive edition · no Arweave dependency
          </figcaption>
        </figure>
      </section>

      <section className="wheelgen-stage site-shell" aria-label="WheelGen studio">
        <div className="wheelgen-stage-bar">
          <p>Live studio</p>
          <a href="/wheelgen/app/" target="_blank" rel="noopener noreferrer">
            Open fullscreen ↗
          </a>
        </div>
        <iframe
          className="wheelgen-frame"
          src="/wheelgen/app/"
          title="WheelGen generative art studio"
          allow="fullscreen"
        />
      </section>
    </main>
  );
}
