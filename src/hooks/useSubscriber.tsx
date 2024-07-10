"use client"
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { subscriptionOf } from "@withfabric/protocol-sdks/stpv2";
import { MUSEV2_ADDRESS } from "@/constants";

// useSubscriber react hook
const useSubscriber = () => {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<any>(null);
  const account = useAccount();
  const address = account?.address || null;

  useEffect(() => {
    if(address != null){
      setIsFetching(true);
      subscriptionOf({
        contractAddress: MUSEV2_ADDRESS,
        account: address as `0x${string}`,
        chainId: 8453,
      }).then((subscription) => {
        setSubscription(subscription);
        console.log({subscription});
        setIsFetching(false);
      });

    }
  }, [address]);

  return { subscription, isFetching };
};

export { useSubscriber };