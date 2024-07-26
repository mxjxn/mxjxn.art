"use client";
import { Button } from "@headlessui/react";
import { useSubscriber } from "@/hooks/useSubscriber";

// const mintFees = [0.01, 0.001];
const monthlyFees = [0.005, 0.001];

export default function MintSubscriptionButton({
  className = "",
  tier = 1,
  months = 3,
}: {
  className: string;
  tier: number;
  months: number;
}) {
  const subscriber = useSubscriber();
  const tierId = Number(subscriber?.subscription?.tierId);
  // const mintFee = tierId === _tier ? 0.0 : mintFees[_tier - 1];
  const monthlyFee = monthlyFees[tier - 1];
  // const fee = (mintFee) + monthlyFee * months;
  const fee = monthlyFee * months;

  const buttonText =
    tier !== tierId
      ? `Mint a Muse Studio ${tier == 1 ? "Patron" : tier == 2 ? "Pass" : ""} NFT`
      : `Add Time to your ${tier == 1 ? "Patron" : tier == 2 ? "Pass" : ""} NFT`;

  const mintFeeClasses = `${tier === tierId ? "line-through" : ""} `;
  console.log({ tier, tierId });
  return (
    <Button className={className}>
      <div className="font-bold text-xl underline decoration-red-500">
        {buttonText}
      </div>
      <div className="flex flex-col w-100 items-end pt-1">
        <div className="flex flex-row justify-end gap-2">
          <div>{months} month: </div>
          <div className="text-md tracking-wide w-100 text-right text-lime-400 border border-transparent border-b-lime-400">
            {fee} ETH
          </div>
        </div>
      </div>
    </Button>
  );
}

/*
// One time fees removed...

          <div className="flex justify-end gap-2">
            <div className={mintFeeClasses}>
              one-time Mint Fee
            </div>
            <div className={"tracking-wide w-24 text-right " + mintFeeClasses}>{mintFees[_tier-1].toPrecision(2)} ETH</div>
          </div>
 */
