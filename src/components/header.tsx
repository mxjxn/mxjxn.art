"use client";

import Link from "next/link";
import ComputerText from "@/components/ComputerText";

const Header = () => {
  return (
    <ComputerText>
      <div
        id="header"
        className="flex tracking-widest h-12 flex-row w-full px-4 items-center justify-between eightbit"
      >
        <Link href="/" className="text-green-500 hover:text-fuchsia-500 transition-colors">
          MXJXN
        </Link>
        <Link href="/art" className="text-teal-500 hover:text-fuchsia-500 transition-colors">
          Art
        </Link>
      </div>
    </ComputerText>
  );
};
export { Header };
