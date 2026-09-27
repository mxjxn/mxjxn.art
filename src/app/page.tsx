import { Exhibition } from "@/components/Exhibition";
import Link from "next/link";
import { ArchiveArtwork } from "@/components/ArchiveGrid";
import { findArtwork } from "@/lib/artworks";

function Selection({ slugs, name }: { slugs: string[]; name: string }) {
  return <div className="home-selection">{slugs.map(slug => {
    const work = findArtwork(slug);
    if (!work) return null;
    return <article className="work-card" key={slug}><ArchiveArtwork work={{ ...work, seriesName: name }} /></article>;
  })}</div>;
}

export default function Home() {
  return (
    <main tabIndex={-1} id="main">
      <Exhibition />
      <div className="home-chapters site-shell">
        <nav className="home-contents" aria-label="Explore my practice">
          <span>Selected works & ongoing projects</span>
          <div><a href="#practice">Daily practice</a><a href="#muse">Muse Editions</a><a href="#onchain">On chain</a><a href="#calligraphy">Calligraphy</a></div>
        </nav>
        <section className="home-chapter" id="practice" aria-labelledby="practice-title">
          <div className="home-chapter-heading">
            <div><p className="section-label">01 / Daily practice</p><h2 id="practice-title">Render till<br />December</h2></div>
            <div className="home-chapter-copy"><p>A daily invitation to make something. To follow a shape, try a material, or see where a little motion leads.</p><p>I’m making room for a regular practice—and for rest days and family time. The point is to keep returning to the work, with curiosity intact.</p><Link className="text-link" href="/series/render-till-december">Explore the practice <span aria-hidden="true">↗</span></Link></div>
          </div>
          <Selection slugs={['daily-48','daily-50','daily-60','daily-46','daily-44','daily-53']} name="Render till December" />
        </section>
        <section className="home-chapter home-muse" id="muse" aria-labelledby="muse-title">
          <div className="home-chapter-heading">
            <div><p className="section-label">02 / A weekly exchange</p><h2 id="muse-title">Muse Editions</h2></div>
            <div className="home-chapter-copy"><p>A new work, delivered each week to paid subscribers of the Muse Studio Hypersub—a subscription NFT.</p><p>These editions were minted on Base. Together, they trace a practice moving between calligraphic forms, imagined spaces, and experiments in motion.</p><Link className="text-link" href="/series/muse-editions">View the editions <span aria-hidden="true">↗</span></Link></div>
          </div>
          <Selection slugs={['muse-editions-30','muse-editions-31','muse-editions-29','muse-editions-33']} name="Muse Editions" />
        </section>
        <section className="home-chapter home-history" id="onchain" aria-labelledby="history-title">
          <div><p className="section-label">03 / Ethereum mainnet</p><p className="home-history-date">31 October<br /><span>2020</span></p></div>
          <div className="home-chapter-copy"><h2 id="history-title">An on-chain<br />beginning.</h2><p>My on-chain art history began on Ethereum mainnet on October 31, 2020. Rarible was part of that beginning: the LENS Collection and works minted through its community contract are important pieces of my early cryptoart history.</p><p>That early chapter is still being gathered here. It belongs alongside the work that followed, as part of one continuing practice.</p><Link className="text-link" href="/archive">Explore the collected work <span aria-hidden="true">↗</span></Link></div>
        </section>
        <section className="home-chapter" id="calligraphy" aria-labelledby="calligraphy-title">
          <div className="home-chapter-heading">
            <div><p className="section-label">04 / Since 2017</p><h2 id="calligraphy-title">Before the pixel,<br />the pen.</h2></div>
            <div className="home-chapter-copy"><p>Calligraphy came before my digital art. Since 2017, it has been a meditative practice: repeated gestures, a rhythm of marks, attention to the space between them.</p><p>These works on paper are a place to return to—and a starting point for the forms that move through my digital work.</p><Link className="text-link" href="/series/meditative-blackletter">Calligraphic meditations <span aria-hidden="true">↗</span></Link></div>
          </div>
          <div className="home-ink"><Selection slugs={['meditative-blackletter-6','meditative-blackletter-5']} name="Meditative Blackletter" /></div>
        </section>
        <div className="home-end"><p>There’s more to explore.</p><Link href="/archive">All collections <span aria-hidden="true">↗</span></Link></div>
      </div>
    </main>
  );
}
