"use client"
// import { useQuery } from "@tanstack/react-query";
import type { SubscriberDetail } from "@withfabric/protocol-sdks/stpv2";
// import { MUSEV2_ADDRESS } from "@/constants";
import  Link from "next/link";
import { useSubscriber } from "@/hooks/useSubscriber";
import { timeRemaining } from "@/utils/date";
const n = (x: any) => Number(x);

function SubscriptionStatus() {
  const { subscription, isFetching } = useSubscriber();
  let tierId, tierName;
  tierId = subscription?.tierId
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
      <h3 className="bold uppercase tracking-wider p-3">Subscription</h3>
      <div className="pt-2 border border-green-300 p-3">
        {tierId !== "" ? (
          <>
            <div className="text-teal-400">{tierName}</div>
            <div>Remaining time: {remainingDays}</div>
            <div>Subbed until: {expiryDate || "no sub"}</div>
            <div><a href={`https://hypersub.withfabric.xyz/s/muse/${tierId}`} className="text-green-400">Extend Subscription</a></div>
            {tierId !== 1 && <div><a href={`https://hypersub.withfabric.xyz/s/muse/1`} className="text-green-400">Upgrade Subscription</a></div>}
          </>
        ) : (
          <>
            <div className="">Not subscribed</div>
            <Link href="/subscribe" className="text-green-400">
              Subscribe now
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default SubscriptionStatus;
