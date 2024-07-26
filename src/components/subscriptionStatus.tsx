"use client";
// import { useQuery } from "@tanstack/react-query";
import type { SubscriberDetail } from "@withfabric/protocol-sdks/stpv2";
// import { MUSEV2_ADDRESS } from "@/constants";
import Link from "next/link";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useSubscriber } from "@/hooks/useSubscriber";
import { timeRemaining } from "@/utils/date";
const n = (x: any) => Number(x);

function SubscriptionStatus() {
  const { subscription, isFetching } = useSubscriber();
  const { address } = useAccount();

  useEffect(() => {
    console.log({ address });
  }, [address]);

  let connected = !!address;
  let tierId, tierName;
  tierId = subscription?.tierId;
  switch (tierId) {
    case 1:
      tierName = "Muse Studio Patron";
      break;
    case 2:
      tierName = "Muse Studio Pass";
    default:
      tierName = "";
  }

  const remainingDays = subscription?.expiresAt
    ? timeRemaining(new Date(n(subscription.expiresAt + "000")))
    : null;
  const expiryDate = new Date(
    n(subscription?.expiresAt + "000")
  ).toDateString();

  return (
    <div className="flex flex-col">
      <h3 className="bold uppercase tracking-wider p-3 pb-8 pl-16">
        Muse Studio Subscription
      </h3>
      <div className="flex justify-end items-center">
        <div className="rotate-90 -mr-6 -mt-10">STATUS</div>
        <div className="pt-2 border border-green-300 p-3 ">
          {!connected ? (
            <>
              <div className="text-teal-400">Please connect your wallet</div>
              <div>To see your Muse Studio status</div>
              <div className="pt-8"></div>
              <div>Muse Studio <span className="uppercase">is an art experience</span></div>
            </>
          ) : tierId !== 0 ? (
            <>
              <div className="text-teal-400">{tierName}</div>
              <div>Remaining time: {remainingDays}</div>
              <div>Subbed until: {expiryDate.toUpperCase() || "no sub"}</div>
              <div className="pt-8">
                <a
                  href={`https://hypersub.withfabric.xyz/s/muse/${tierId}`}
                  className="text-green-400"
                >
                  Extend Subscription
                </a>
              </div>
              {tierId == 2 && (
                <div>
                  <a
                    href={`https://hypersub.withfabric.xyz/s/muse/1`}
                    className="text-green-400"
                  >
                    Upgrade Subscription
                  </a>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="pb-12">Not subscribed</div>

              <div>
                <Link
                  href="/subscribe"
                  className="text-teal-400 hover:underline underline-offset-8"
                >
                  Learn More
                </Link>
              </div>
              <div className="pt-4 hover:underline underline-offset-8">
                <a
                  href="https://hypersub.withfabric.xyz/s/muse/1"
                  className="text-green-400"
                >
                  Subscribe now on Hypersub
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubscriptionStatus;
