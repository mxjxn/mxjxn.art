import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
export const metadata: Metadata = {
  title: "About",
  description:
    "Max Jackson is an artist working across calligraphy, 3D, generative processes, and moving images.",
};
export default function About() {
  return (
    <main tabIndex={-1} id="main" className="site-shell">
      <section className="about-layout">
        <div className="about-copy">
          <span className="section-label">MXJXN</span>
          <h1>Max Jackson.</h1>
          <p className="lead">
            An artist working across calligraphy, 3D, generative processes, and
            moving images.
          </p>
          <p>
            My work moves between marks made by hand and forms built in digital
            space. Calligraphic abstraction runs through the practice: on paper,
            in sculptural experiments, and inside systems that generate new
            images.
          </p>
          <p>
            I have been minting work since October 2020. This site brings
            together selected pieces and ongoing projects from that practice.
          </p>
          <p>
            Render till December is my current daily project: a new render each
            day, with room to follow an idea and see where it leads.
          </p>
          <a href="mailto:mjackson84@gmail.com" className="text-link">
            Get in touch ↗
          </a>
        </div>
        <figure>
          <Link
            href="/art/meditative-blackletter-6"
            className="art-image about-art"
            aria-label="View Azure Heat"
          >
            <Image
              src="/meditations/m6.png"
              alt="Azure Heat, a calligraphic composition in watercolor ink on paper."
              fill
              sizes="(max-width:600px) 88vw, 44vw"
              priority
            />
          </Link>
          <figcaption className="art-caption">
            <span>Azure Heat</span>
            <span>Meditative Blackletter · 2023</span>
          </figcaption>
        </figure>
      </section>
    </main>
  );
}
