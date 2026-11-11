import Image from "next/image";
import Link from "next/link";
import { artworks, publicUrl } from "@/lib/artworks";

export function getCalligraPics() {
  return artworks
    .filter((work) => work.series === "calligra-pics" && work.thumbnail)
    .sort(
      (a, b) =>
        Number(a.slug.split("-").pop()) - Number(b.slug.split("-").pop()),
    );
}

export function CalligraGrid({
  labelledBy,
}: {
  labelledBy?: string;
} = {}) {
  const items = getCalligraPics();
  return (
    <div
      className="calligra-mosaic"
      role="list"
      aria-label={labelledBy ? undefined : "All 100 Calligra Pics"}
      aria-labelledby={labelledBy}
    >
      {items.map((work) => (
        <Link
          key={work.slug}
          href={`/art/${work.slug}`}
          className="calligra-mosaic-cell"
          role="listitem"
          title={work.title}
        >
          <Image
            src={publicUrl(work.thumbnail!)}
            alt={work.title}
            width={240}
            height={240}
            sizes="(max-width: 700px) 10vw, 9vw"
          />
        </Link>
      ))}
    </div>
  );
}
