import { Exhibition } from "@/components/Exhibition";
import Link from "next/link";
import { ArchiveArtwork } from "@/components/ArchiveGrid";
import { CalligraGrid } from "@/components/CalligraGrid";
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
            <div><p className="section-label">01 / A completed practice</p><h2 id="practice-title">100 Days<br />of Blender</h2></div>
            <div className="home-chapter-copy"><p>One hundred days of making something in Blender—following a shape, trying a material, seeing where a little motion leads.</p><p>The series has concluded. Selected days will join the minted set; for now, these are a few of the gems.</p><Link className="text-link" href="/series/100-days-of-blender">Explore the series <span aria-hidden="true">↗</span></Link></div>
          </div>
          <Selection slugs={['daily-100','daily-80','daily-48','daily-60','daily-50','daily-92']} name="100 Days of Blender" />
        </section>
        <section className="home-chapter home-muse" id="muse" aria-labelledby="muse-title">
          <div className="home-chapter-heading">
            <div><p className="section-label">02 / A weekly exchange</p><h2 id="muse-title">Muse Editions</h2></div>
            <div className="home-chapter-copy"><p>Weekly editions for Muse Studio Hypersub subscribers—minted on Base as an ERC-1155.</p><p>Calligraphic forms, imagined spaces, and moving image. The full set lives in the collection; these are a few of the gems.</p><Link className="text-link" href="/series/muse-editions">View all editions <span aria-hidden="true">↗</span></Link></div>
          </div>
          <Selection slugs={['muse-editions-61','muse-editions-30','muse-editions-43','muse-editions-33']} name="Muse Editions" />
        </section>
        <section className="home-chapter home-history" id="onchain" aria-labelledby="history-title">
          <div><p className="section-label">03 / Ethereum mainnet</p><p className="home-history-date">31 October<br /><span>2020</span></p></div>
          <div className="home-chapter-copy"><h2 id="history-title">An on-chain<br />beginning.</h2><p>My on-chain art history began on Ethereum mainnet on October 31, 2020. Rarible was part of that beginning: the LENS Collection and works minted through its community contract are important pieces of my early cryptoart history.</p><p>That early chapter is still being gathered here. It belongs alongside the work that followed, as part of one continuing practice.</p><Link className="text-link" href="/archive">Explore the collected work <span aria-hidden="true">↗</span></Link></div>
        </section>
        <section className="home-chapter" id="calligraphy" aria-labelledby="calligraphy-title">
          <div className="home-chapter-heading">
            <div><p className="section-label">04 / Since 2017</p><h2 id="calligraphy-title">Before the pixel,<br />the pen.</h2></div>
            <div className="home-chapter-copy"><p>Calligraphy came before my digital art. Since 2017, it has been a meditative practice: repeated gestures, a rhythm of marks, attention to the space between them.</p><p>In 2021, Calligra Pics brought that practice on-chain—one hundred abstracts, my first out collection. The full set is below; the paper meditations remain a place to return to.</p><Link className="text-link" href="/series/calligra-pics">Open the collection <span aria-hidden="true">↗</span></Link></div>
          </div>
          <div className="home-ink"><Selection slugs={['meditative-blackletter-6','meditative-blackletter-5']} name="Meditative Blackletter" /></div>
          <div className="home-calligra">
            <p className="section-label">Calligra Pics · 100</p>
            <CalligraGrid />
          </div>
        </section>
        <div className="home-end"><p>There’s more to explore.</p><Link href="/archive">All collections <span aria-hidden="true">↗</span></Link></div>
      </div>
    </main>
  );
}
