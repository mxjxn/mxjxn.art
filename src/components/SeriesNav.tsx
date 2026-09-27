import Link from "next/link";
import { series } from "@/lib/artworks";
export function SeriesNav({ active }: { active?: string }) {
  return (
    <nav className="series-nav" aria-label="Artwork series">
      <Link href="/archive" aria-current={!active ? "page" : undefined}>
        Collections
      </Link>
      {series.map((item) => (
        <Link
          key={item.slug}
          href={`/series/${item.slug}`}
          aria-current={active === item.slug ? "page" : undefined}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
