import { Metadata } from "next";
import Image from "next/image";

import MintSubscriptionButton from "@/components/MintSubscriptionButton";

export const metadata: Metadata = {
  title: "Subscribe to Muse Studio",
};

export default function SubscribePage() {
  return (
    <div>
      <div
        className="w-full min-h-[80%] absolute top-0 -z-10 bg-cover bg-top"
        style={{ backgroundImage: "url(phoenix.gif)" }}
      >
        <div className="w-full h-full absolute bg-gradient-to-b from-[#00000044] to-[#000000ff] -z-10"></div>
      </div>
      <div className="w-full mx-auto my-12 blur-sm">
        <div className="transition-all lg:text-[12.5em] md:text-[8em] sm:text-[6em] text-[5em] leading-[0.45] pb-10 text-center">
          <div className="w-full text-white tracking-[-0.1em]">Muse Studio</div>
          <div className="w-full text-blue-500 opacity-90 tracking-[-0.06em] font-bold">
            on chain art
          </div>
          <div className="w-full text-green-500 opacity-70 tracking-[-0.09em]">
            Subscription
          </div>
        </div>
      </div>
      <div className="flex w-full xl:flex-row flex-col px-16 gap-6">
        <div className="text-xl xl:w-3/6 lg:w-9/12 md:w-11/12 mx-auto my-12 flex flex-col gap-6">
          <div>
            <div className="text-red-600 xl:text-6xl md:text-7xl sm:text-4xl pb-5">
              Dont just mint, be a patron.
            </div>{" "}
            Mint a Patron tier NFT for one year.
          </div>

          <div>
            Muse Studio Patrons receive weekly art, exclusive access to
            physicals, free mints, raffle tickets, and royalty splits on new
            collections.
          </div>

          <div>
            Not to mention all those Muse Editions can be redeemed for exclusive
            1/1s, shirts and physical artworks.
          </div>

          <div>
            A patron is someone who empowers me to continue my work with full
            attention. It is immensely valuable to me and so I attempt to reward
            my Patrons continuously through art and rewards.
          </div>
          <div>
            If you like the art that I am making, mint a Pass. If you believe in
            what I'm building, mint the Patron NFT.
          </div>
        </div>
        <div>
          <div className="flex flex-col items-center justify-center md:flex-row sm:flex-col gap-4 ">
            <div className="flex justify-center py-8">
              <a href="https://hypersub.withfabric.xyz/s/muse/1">
                <div className="min-w-96 flex flex-col items-center justify-center py-8 border-4 border-green-900 hover:border-red-500 bg-[#000000ca] transition-all">
                  <Image
                    src="/muse-patron.gif"
                    width={320}
                    height={320}
                    alt="muse studio patron nft"
                  />
                  <div className="pt-3">
                    <MintSubscriptionButton
                      tier={1}
                      className="text-slate-100 pb-2 border border-slate-700 px-3 py-2 bg-gradient-to-b from-slate-800 to-slate-900"
                    />
                    <div className="mx-3">
                      <div className="text-slate-100 pt-4 tracking-wider">
                        Patrons receive:
                      </div>
                      <ul className="hot list-square list-inside">
                        <li>Muse Editions Weekly Airdrop</li>
                        <li>Free Mints</li>
                        <li>Royalty Splits</li>
                        <li>Private Group Chat</li>
                        <li>Token-Gated newsletter updates</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </a>
            </div>
            <div className="flex justify-center py-8">
              <a href="https://hypersub.withfabric.xyz/s/muse/2">
                <div className="min-w-96  flex flex-col items-center py-8 border border-slate-800 hover:border-slate-500 bg-[#000000ca] transition-all">
                  <Image
                    src="/muse-pass.png"
                    width={320}
                    height={320}
                    alt="muse studio pass nft"
                  />
                  <div className="pt-3">
                    <MintSubscriptionButton
                      tier="2"
                      className="text-slate-100 pb-2  px-3 py-2 bg-gradient-to-b from-slate-900 to-slate-950"
                    />
                    <div className="mx-3">
                      <div className="text-slate-300 pt-4 tracking-wider">
                        Pass holders receive:
                      </div>
                      <ul className="cold list-square list-inside">
                        <li>Monthly Airdrops</li>
                        <li>Exclusive Mints</li>
                        <li>Private Group Chat</li>
                        <li>Newsletter</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="p-16">
      <div
        className="w-full h-96 top-0 -z-10 bg-cover bg-top flex flex-col items-center justify-center"
        style={{ backgroundImage: "url(evolution.jpg)" }}
      >
        <h2 className="w-full text-center text-7xl text-red-300 p-8 bg-[#00000088]">See all Muse Studio Drops</h2>
      </div>
      </div>
    </div>
  );
}
