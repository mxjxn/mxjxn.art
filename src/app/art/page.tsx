import type { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";

const ArtCard = ({
  artHref,
  title = "",
  link = "",
  description = "",
  className = "",
}: {
  artHref: string;
  title?: string;
  link?: string;
  description?: string;
  className?: string;
}) => {
  let classes =
    "basis-full md:basis-3/6 lg:basis-2/6 max-w-xs p-1 bg-slate-700 rounded-lg transition-transform hover:scale-110 " +
    className;
  return (
    <div className={classes}>
      <a href={link}>
        <div className="relative w-full h-72 overflow-hidden rounded-lg">
          <Image
            className="rounded-lg absolute top-0 left-0 w-full h-full object-cover"
            src={artHref}
            height="320"
            width="320"
            alt={description || ""}
          />
        </div>
        <div className="py-2 px-3 rounded-md mt-1 bg-gradient-to-b from-transparent to-slate-600">{title}</div>
      </a>
    </div>
  );
};

const VideoCard = ({
  artHref,
  title = "",
  link = "",
  description = "",
}: {
  artHref: string;
  title?: string;
  link?: string;
  description?: string;
}) => {
  return (
    <div className="basis-full md:basis-3/6 lg:basis-2/6 max-w-xs p-1 bg-slate-700 rounded-lg transition-transform scale-100 hover:scale-110">
      <a href={link}>
<div className="h-72 relative">
        <video
          className="overflow-hidden rounded-lg absolute top-0 left-0 w-full h-full object-cover"
          width="320"
          autoPlay
          loop
        >
          <source src={artHref} type="video/mp4" />
        </video>
</div>
        <div className="py-2 px-3 rounded-md mt-1 bg-gradient-to-b from-transparent to-slate-600">{title}</div>
      </a>
    </div>
  );
};

const Art: NextPage = () => {
  return (
    <div className="px-8">
      <div className="bg-secondary eightbit p-8">
        <h1 className="text-4xl pb-8 text-red-500">Max Jackson</h1>
        <h1 className="text-4xl text-fuchsia-500">Selected Onchain Artworks</h1>
      </div>

      <div className="py-8 px-2 mt-16 card bg-gradient-to-b from-slate-900 to-transparent rounded-t-3xl">
        <h2 className="text-5xl eightbit text-teal-500">Muse Editions</h2>
        <div className="max-w-10/12 my-8">
          <p>
            Muse Editions are weekly artworks airdropped to my{" "}
            <Link href="/subscribe">Muse Studio Patrons</Link>. They can be
            bought and sold on{" "}
            <a
              className="underline"
              href="https://sudoswap.xyz/#/browse/base/buy/0x528fD133D6fB004FAccC08b70E04186299Eba176"
            >
              Sudoswap
            </a>{" "}
            and viewed on{" "}
            <a
              className="underline"
              href="https://opensea.io/collection/muse-editions"
            >
              OpenSea
            </a>
            .
          </p>
        </div>
        <div className="p-4 flex flex-row flex-wrap justify-around gap-8">
          <ArtCard
            artHref="/muse-editions/chromaticsymphony.gif"
            link="https://gallery.manifold.xyz/base/0x528fd133d6fb004faccc08b70e04186299eba176/33"
            title="No. 33 - Chromatic Symphony"
          />
          <ArtCard
            artHref="/muse-editions/forgedimbalance.jpg"
            link="https://gallery.manifold.xyz/base/0x528fd133d6fb004faccc08b70e04186299eba176/31"
            title="No. 31 - Forged Imbalance"
          />
          <VideoCard
            artHref="/muse-editions/phoenixlens.mp4"
            link="https://gallery.manifold.xyz/base/0x528fd133d6fb004faccc08b70e04186299eba176/30"
            title="No. 30 - Phoenix Lens"
          />
          <ArtCard
            artHref="/muse-editions/obsidianbloom.jpg"
            link="https://gallery.manifold.xyz/base/0x528fd133d6fb004faccc08b70e04186299eba176/29"
            title="No. 29 - Obsidian Bloom"
          />
          <VideoCard
            artHref="/muse-editions/processmorph.mp4"
            link="https://gallery.manifold.xyz/base/0x528fd133d6fb004faccc08b70e04186299eba176/28"
            title="No. 28 - Process Morph"
          />
        </div>
      </div>
      <div className="p-8 mt-16 card bg-gradient-to-b from-slate-900 to-transparent rounded-t-3xl">
        <h2 className="text-5xl eightbit text-teal-500">Meditative Blackletter</h2>
        <div className="max-w-10/12 my-8">
          <p>
            These physical artworks are available as 1/1 NFTs on Ethereum. The
            first buyer of an NFT is entitled to the framed physical.
          </p>
        </div>
        <div className="p-4 flex flex-row flex-wrap justify-around gap-8">
          <ArtCard
            artHref="/meditations/m1.png"
            link="https://gallery.manifold.xyz/0x9bf7964dfdd9aef4a4038b3d7c0a7e953dcd54d5/1"
            title="Meditation 1"
          />
          <ArtCard
            artHref="/meditations/m2.png"
            link="https://gallery.manifold.xyz/0x9bf7964dfdd9aef4a4038b3d7c0a7e953dcd54d5/2"
            title="Meditation 2"
          />
          <ArtCard
            artHref="/meditations/m3.png"
            link="https://gallery.manifold.xyz/0x9bf7964dfdd9aef4a4038b3d7c0a7e953dcd54d5/3"
            title="Meditation 3"
          />
          <ArtCard
            artHref="/meditations/m4.png"
            link="https://gallery.manifold.xyz/0x9bf7964dfdd9aef4a4038b3d7c0a7e953dcd54d5/4"
            title="Meditation 4"
          />
          <ArtCard
            artHref="/meditations/m5.png"
            link="https://gallery.manifold.xyz/0x9bf7964dfdd9aef4a4038b3d7c0a7e953dcd54d5/5"
            title="Meditation 5"
          />
          <ArtCard
            artHref="/meditations/m6.png"
            link="https://gallery.manifold.xyz/0x9bf7964dfdd9aef4a4038b3d7c0a7e953dcd54d5/6"
            title="Meditation 6"
          />
        </div>
      </div>
      <div className="p-8 mt-16 card bg-gradient-to-b from-slate-900 to-transparent rounded-t-3xl">
        <div className="max-w-10/12 text-5xl eightbit text-teal-500">Reaching The Source</div>
        <p className="max-w-10/12 my-8">
          My first experiments with AI in early 2021. I trained a GAN model on
          roughly 100 of my calligraphic, 3d and glitch artworks. The results
          were curated and manipulated, and minted via charged.fi.
        </p>
        <div className="p-4 flex flex-row flex-wrap justify-around gap-8">
          <ArtCard
            artHref="/srclensx.jpg"
            link="https://rarible.com/token/0x63174fa9680c674a5580f7d747832b2a2133ad8f:47"
            title="srcLENS:X"
          />
          <ArtCard
            artHref="/srclensz.jpg"
            link="https://rarible.com/token/0x63174fa9680c674a5580f7d747832b2a2133ad8f:49"
            title="srcLENS:Z"
          />
          <ArtCard
            artHref="/source.jpg"
            link="https://rarible.com/token/0x63174fa9680c674a5580f7d747832b2a2133ad8f:60"
            title="Source"
          />
        </div>
      </div>
      <div className="p-8 mt-16 card bg-gradient-to-b from-slate-900 to-transparent rounded-t-3xl">
        <div className="max-w-10/12 text-5xl  eightbit text-teal-500">Calligra Pics</div>
        <p className="max-w-10/12 my-8">
          A series of 100 calligraphic abstracts, made and minted in the summer
          of 2021.
        </p>
        <div className="p-4 flex flex-row flex-wrap justify-around gap-8">
          <ArtCard
            artHref="/calligrapics/c26.jpg"
            link="https://opensea.io/collection/calligrapics"
            title="Calligra Pic 26"
          />
          <ArtCard
            artHref="/calligrapics/c62.jpg"
            link="https://opensea.io/collection/calligrapics"
            title="Calligra Pic 62"
          />
          <ArtCard
            artHref="/calligrapics/c74.png"
            link="https://opensea.io/collection/calligrapics"
            title="Calligra Pic 74"
          />
          <ArtCard
            artHref="/calligrapics/c58.jpg"
            link="https://opensea.io/collection/calligrapics"
            title="Calligra Pic 58"
          />
          <ArtCard
            artHref="/calligrapics/c95.jpg"
            link="https://opensea.io/collection/calligrapics"
            title="Calligra Pic 95"
          />
          <ArtCard
            artHref="/calligrapics/c100.jpg"
            link="https://opensea.io/collection/calligrapics"
            title="Calligra Pic 100"
          />
        </div>

      <div className="p-4 mt-16 card bg-gradient-to-b from-slate-900 to-transparent rounded-t-3xl">
        <div className="max-w-10/12 text-5xl eightbit text-teal-500">Pure AI series</div>
        <p className="max-w-10/12 my-8">Collections made using Stable Diffusion, Midjourney and DALLE3</p>
        <div className="p-4 flex flex-row flex-wrap justify-around gap-8">
          <ArtCard
            artHref="/hyper-ghouls/weeping-crimson-ceremony.png"
            link="https://zora.co/collect/zora:0x808bca1944bcb79a5c074d50e6dc59e50a0f3d21/"
            title="HYPER GHOULS"
          />
          <ArtCard
            artHref="/degenghouls/degenghoul99.jpg"
            link="https://sudoswap.xyz/#/browse/base/buy/0x0426ee5b20e72bfbb0e5c81751b169b89626b834"
            title="DegenGhouls"
          />
          <ArtCard
            artHref="/degencats/degencat44.png"
            link="https://sudoswap.xyz/#/browse/base/buy/0x7Beb6Ff3B9D527dc896b5B0b7FEF0b8EE0DCF59e"
            title="DegenCats"
          />
          <ArtCard
            artHref="/ethereal-realms/ethereal-realm-viii.png"
            link="https://www.curate.page/t/ethereal-realms"
            title="Ethereal Realms"
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export const dynamic = "force-static";

export default Art;
