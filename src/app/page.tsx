import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="main-page flex min-h-screen flex-col items-center justify-between p-24">
      <ul>
        <li>
          <a href="https://hypersub.withfabric.xyz/collection/muse-token-10tgfr94805j4">
            Subscribe to Muse
          </a>
        </li>
        <li>
          <Link href="/rank-check">rank-check</Link>
        </li>
      </ul>
    </main>
  );
}
