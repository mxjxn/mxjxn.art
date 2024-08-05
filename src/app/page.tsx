"use client";
import { Header } from "@/components/header";
import Link from "next/link";
import SubscriptionStatus from "@/components/subscriptionStatus";

function App() {
  return (
    <div className="eightbit">
      <Header />
      <div className="flex flex-row w-full justify-end">
        <div className="px-4 flex flex-col items-center md:items-start gap-8 w-full">
          <div className="text-green-500 w-full text-3xl pt-4 text-center md:text-left leading-10">
            MXJXN is
            <Link href="/art">
              <span className="inline-block my-8 md:inline border border-red-500 hover:text-fuchsia-500 hover:border-yellow-500 transition-colors p-2 mx-2">
                finding forms
              </span>
            </Link>
            between dimensions
          </div>
            <div className="w-full text-2xl pt-8 text-center md:text-left text-slate-500">
              <span className="inline-block md:inline border border-red-500 text-teal-500 hover:text-fuchsia-500 hover:border-yellow-500 transition-colors p-2 mx-2">
          <Link href="/subscribe">
                Join Muse Studio
          </Link>
              </span>{" "}
              to follow my journey
            </div>
            <div className="w-full text-2xl text-center md:text-left text-slate-500">
              A New Artwork airdropped every week to your wallet
            </div>
          <SubscriptionStatus />
        </div>
      </div>
    </div>
  );
}

export default App;
