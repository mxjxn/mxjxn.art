// Listing enum and bid arithmetic verified against MarketplaceLib / SettlementLib.
// https://github.com/mxjxn/auctionhouse-contracts/tree/main/src/libs
export type Listing = {
  id: bigint;
  seller: string;
  finalized: boolean;
  totalSold: number;
  details: {
    initialAmount: bigint;
    type_: number;
    totalAvailable: number;
    totalPerSale: number;
    extensionInterval: number;
    minIncrementBPS: number;
    erc20: string;
    identityVerifier: string;
    startTime: number;
    endTime: number;
  };
  token: { id: bigint; address_: string; spec: number; lazy: boolean };
  fees: { deliverBPS: number; deliverFixed: bigint };
  bid: {
    amount: bigint;
    bidder: string;
    delivered: boolean;
    refunded: boolean;
  };
};
export type SaleIdentity = {
  listingId: number;
  seller: string;
  token: string;
  tokenId: bigint;
};
export type SaleSnapshot = {
  state: "ready" | "scheduled" | "active" | "ended" | "closed" | "collected";
  reserveWei: string;
  minimumWei: string;
  highestWei: string;
  bidder: string;
  startTime: number;
  endTime: number;
  extensionSeconds: number;
  blockTimestamp: number;
  blockNumber: string;
  checkedAt: number;
};
const ZERO = "0x0000000000000000000000000000000000000000";
export function verifyListing(listing: Listing, expected: SaleIdentity) {
  if (
    listing.id !== BigInt(expected.listingId) ||
    listing.seller.toLowerCase() !== expected.seller.toLowerCase() ||
    listing.token.address_.toLowerCase() !== expected.token.toLowerCase() ||
    listing.token.id !== expected.tokenId
  )
    throw new Error("The auction identity could not be verified.");
  // The Solidity enum starts with INVALID (0); INDIVIDUAL_AUCTION is 1.
  if (
    listing.details.type_ !== 1 ||
    listing.token.spec !== 1 ||
    listing.token.lazy ||
    listing.details.erc20.toLowerCase() !== ZERO ||
    listing.details.identityVerifier.toLowerCase() !== ZERO ||
    listing.details.totalAvailable !== 1 ||
    listing.details.totalPerSale !== 1 ||
    listing.fees.deliverBPS !== 0 ||
    listing.fees.deliverFixed !== 0n
  )
    throw new Error(
      "The auction terms have changed. Please check the original listing.",
    );
}
export function minimumBid(
  reserve: bigint,
  highest: bigint,
  incrementBps: number,
) {
  if (highest === 0n) return reserve;
  const increment = (highest * BigInt(incrementBps)) / 10000n;
  return highest + (increment > 0n ? increment : 1n);
}
export function auctionState(
  listing: Listing,
  now: number,
): SaleSnapshot["state"] {
  if (listing.bid.delivered || listing.totalSold > 0) return "collected";
  if (listing.finalized) return "closed";
  if (listing.details.startTime === 0) return "ready";
  if (listing.details.startTime > now) return "scheduled";
  if (listing.details.endTime <= now) return "ended";
  return "active";
}
export function parseBid(value: string) {
  const clean = value.trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,18})?$/.test(clean))
    throw new Error("Enter an ETH amount with up to 18 decimal places.");
  const [whole, fraction = ""] = clean.split(".");
  const amount = BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, "0"));
  if (amount <= 0n) throw new Error("Enter a bid greater than zero.");
  return amount;
}
export function validateClaim(
  snapshot: SaleSnapshot,
  account: string,
  now = Date.now(),
) {
  if (Math.abs(now - snapshot.checkedAt) > 60000)
    throw new Error("Refresh the auction before claiming.");
  if (
    snapshot.state !== "ended" ||
    snapshot.highestWei === "0" ||
    snapshot.blockTimestamp <= snapshot.endTime
  )
    throw new Error("This artwork is not ready to claim.");
  if (account.toLowerCase() !== snapshot.bidder.toLowerCase())
    throw new Error("Connect the winning wallet to claim this artwork.");
}
export function validateBid(
  snapshot: SaleSnapshot,
  value: string,
  account: string,
  seller: string,
  now = Date.now(),
) {
  if (now - snapshot.checkedAt > 60000 || snapshot.checkedAt - now > 60000)
    throw new Error("Refresh the auction before placing a bid.");
  if (snapshot.state !== "ready" && snapshot.state !== "active")
    throw new Error("This auction is not accepting bids.");
  const chainNow =
    snapshot.blockTimestamp + Math.max(0, now - snapshot.checkedAt) / 1000;
  if (snapshot.startTime !== 0 && snapshot.endTime <= chainNow)
    throw new Error("This auction has ended.");
  if (account.toLowerCase() === seller.toLowerCase())
    throw new Error("The artist cannot bid from the selling wallet.");
  if (account.toLowerCase() === snapshot.bidder.toLowerCase())
    throw new Error("You already hold the highest bid.");
  const amount = parseBid(value);
  if (amount < BigInt(snapshot.minimumWei))
    throw new Error("The minimum bid has changed. Review the latest amount.");
  return amount;
}
