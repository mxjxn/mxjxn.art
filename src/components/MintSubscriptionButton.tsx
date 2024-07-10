"use client";
import { Button } from "@headlessui/react";
import { useSubscriber } from "@/hooks/useSubscriber";

const mintFees = [0.05, 0.004];
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
  const _tier = Number(tier);
  const tierId = Number(subscriber?.subscription?.tierId);
  const mintFee = tierId === _tier ? 0.0 : mintFees[_tier - 1];
  const monthlyFee = monthlyFees[_tier - 1];
  const fee = (mintFee) + monthlyFee * months;

  const buttonText = _tier !== tierId
    ? `Mint a Muse Studio ${_tier == 1 ? "Patron" : _tier == 2 ? "Pass" : ""} NFT`
    : `Add Time to your ${_tier == 1 ? "Patron" : _tier == 2 ? "Pass" : ""} NFT`

  const mintFeeClasses = `${_tier === tierId ? "line-through" : ""} `
  console.log({ _tier, tierId });
  return (
      <Button className={className}>
        <div className="font-bold text-xl underline decoration-red-500">
          {buttonText}
        </div>
        <div className="flex flex-col w-100 items-end pt-1">
          <div className="flex justify-end gap-2">
            <div className={mintFeeClasses}>
              one-time Mint Fee
            </div>
            <div className={"tracking-wide w-24 text-right " + mintFeeClasses}>{mintFees[_tier-1].toPrecision(2)} ETH</div>
          </div>
          <div className="flex justify-end gap-2">
            <div> + {months} month: </div>
            <div className="text-md tracking-wide w-24 text-right">{monthlyFee * months} ETH</div>
          </div>

          <div className="text-md tracking-wide w-100 text-right text-lime-400 border border-transparent border-t-lime-400  -m-1 p-1 mt-1">{fee} ETH</div>
        </div>
      </Button>
  );
}
