import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { AUCTION_ABI, SALE } from "./auction-contract";
import {
  auctionState,
  minimumBid,
  verifyListing,
  type SaleSnapshot,
} from "./sale-state";

export const ethereum = createPublicClient({
  chain: mainnet,
  transport: http("https://ethereum-rpc.publicnode.com", {
    timeout: 12000,
    retryCount: 1,
  }),
});

export async function readAuction(): Promise<SaleSnapshot> {
  const [chainId, block] = await Promise.all([
    ethereum.getChainId(),
    ethereum.getBlock(),
  ]);
  if (chainId !== SALE.chainId || block.number === null)
    throw new Error("Ethereum could not be verified.");
  if (Math.abs(Date.now() / 1000 - Number(block.timestamp)) > 180)
    throw new Error("The Ethereum connection is behind. Please try again.");
  const listing = await ethereum.readContract({
    address: SALE.marketplace,
    abi: AUCTION_ABI,
    functionName: "getListing",
    args: [SALE.listingId],
    blockNumber: block.number,
  });
  verifyListing(listing, SALE);
  return {
    state: auctionState(listing, Number(block.timestamp)),
    reserveWei: listing.details.initialAmount.toString(),
    minimumWei: minimumBid(
      listing.details.initialAmount,
      listing.bid.amount,
      listing.details.minIncrementBPS,
    ).toString(),
    highestWei: listing.bid.amount.toString(),
    bidder: listing.bid.bidder,
    startTime: listing.details.startTime,
    endTime: listing.details.endTime,
    extensionSeconds: listing.details.extensionInterval,
    blockTimestamp: Number(block.timestamp),
    blockNumber: block.number.toString(),
    checkedAt: Date.now(),
  };
}
