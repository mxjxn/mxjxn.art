"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function Header() {
  const path = usePathname();
  return (
    <header
      className={`site-header site-shell ${path === "/" ? "over-art" : ""}`}
    >
      <Link className="wordmark" href="/" aria-label="MXJXN — home">
        mxjxn
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/" aria-current={path === "/" ? "page" : undefined}>
          Home
        </Link>
        <Link
          href="/art"
          aria-current={
            path.startsWith("/art") ||
            path === "/archive" ||
            path.startsWith("/series/")
              ? "page"
              : undefined
          }
        >
          Work
        </Link>
        <Link
          href="/collect"
          aria-current={path === "/collect" ? "page" : undefined}
        >
          Collect
        </Link>
        <Link
          href="/about"
          aria-current={path === "/about" ? "page" : undefined}
        >
          About
        </Link>
      </nav>
    </header>
  );
}
