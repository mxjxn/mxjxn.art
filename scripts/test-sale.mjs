import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { encodeFunctionData, decodeFunctionData } from "viem";
async function load(path) {
  const js = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(
    "data:text/javascript;base64," + Buffer.from(js).toString("base64")
  );
}
const {
  parseBid,
  minimumBid,
  verifyListing,
  auctionState,
  validateBid,
  validateClaim,
} = await load("src/lib/sale-state.ts");
const { SALE, AUCTION_ABI } = await load("src/lib/auction-contract.ts");
const zero = "0x0000000000000000000000000000000000000000";
const collector = "0x1111111111111111111111111111111111111111";
const listing = {
  id: 5n,
  seller: SALE.seller,
  finalized: false,
  totalSold: 0,
  details: {
    initialAmount: 50000000000000000n,
    type_: 1,
    totalAvailable: 1,
    totalPerSale: 1,
    extensionInterval: 0,
    minIncrementBPS: 500,
    erc20: zero,
    identityVerifier: zero,
    startTime: 0,
    endTime: 604800,
  },
  token: { id: 1n, address_: SALE.token, spec: 1, lazy: false },
  fees: { deliverBPS: 0, deliverFixed: 0n },
  bid: { amount: 0n, bidder: zero, delivered: false, refunded: false },
};
const now = 1790485600000;
const snapshot = {
  state: "ready",
  reserveWei: "50000000000000000",
  minimumWei: "50000000000000000",
  highestWei: "0",
  bidder: zero,
  startTime: 0,
  endTime: 604800,
  extensionSeconds: 0,
  blockTimestamp: now / 1000,
  blockNumber: "26066595",
  checkedAt: now,
};
test("ETH values retain every wei and reject rounding or scientific notation", () => {
  assert.equal(parseBid("0.050000000000000001"), 50000000000000001n);
  assert.equal(parseBid("1.000000000000000001"), 1000000000000000001n);
  for (const bad of [
    "0",
    "-1",
    "NaN",
    "1e-3",
    "0.1234567890123456789",
    "Infinity",
    "1,000",
    "",
  ])
    assert.throws(() => parseBid(bad));
});
test("minimum bid follows Solidity floor division with a minimum one-wei increase", () => {
  assert.equal(minimumBid(50000000000000000n, 0n, 500), 50000000000000000n);
  assert.equal(minimumBid(0n, 50000000000000000n, 500), 52500000000000000n);
  assert.equal(minimumBid(0n, 1n, 500), 2n);
  assert.equal(minimumBid(0n, 500n, 0), 501n);
});
test("pins seller, token, listing, native ETH, single ERC721 and verified auction enum", () => {
  assert.doesNotThrow(() => verifyListing(listing, SALE));
  for (const changed of [
    { ...listing, id: 6n },
    { ...listing, seller: collector },
    { ...listing, token: { ...listing.token, id: 2n } },
    { ...listing, token: { ...listing.token, address_: collector } },
    { ...listing, details: { ...listing.details, type_: 0 } },
    { ...listing, details: { ...listing.details, type_: 2 } },
    { ...listing, details: { ...listing.details, erc20: collector } },
    {
      ...listing,
      details: { ...listing.details, identityVerifier: collector },
    },
    { ...listing, fees: { deliverBPS: 1, deliverFixed: 0n } },
  ])
    assert.throws(() => verifyListing(changed, SALE));
});
test("first-bid duration is not mistaken for an expired timestamp", () => {
  assert.equal(auctionState(listing, now / 1000), "ready");
  assert.equal(
    auctionState(
      {
        ...listing,
        details: {
          ...listing.details,
          startTime: now / 1000 + 100,
          endTime: now / 1000 + 1000,
        },
      },
      now / 1000,
    ),
    "scheduled",
  );
  assert.equal(
    auctionState(
      {
        ...listing,
        details: {
          ...listing.details,
          startTime: now / 1000 - 100,
          endTime: now / 1000 + 1000,
        },
      },
      now / 1000,
    ),
    "active",
  );
  assert.equal(
    auctionState(
      {
        ...listing,
        details: {
          ...listing.details,
          startTime: now / 1000 - 100,
          endTime: now / 1000,
        },
      },
      now / 1000,
    ),
    "ended",
  );
  assert.equal(
    auctionState({ ...listing, finalized: true }, now / 1000),
    "closed",
  );
  assert.equal(
    auctionState({ ...listing, totalSold: 1 }, now / 1000),
    "collected",
  );
});
test("bid validation blocks stale, ended, cancelled, under-minimum, seller and current leader bids", () => {
  assert.equal(
    validateBid(snapshot, "0.05", collector, SALE.seller, now),
    50000000000000000n,
  );
  assert.throws(() =>
    validateBid(snapshot, "0.049", collector, SALE.seller, now),
  );
  assert.throws(() =>
    validateBid(snapshot, "0.05", collector, SALE.seller, now + 61000),
  );
  assert.throws(() =>
    validateBid(snapshot, "0.05", SALE.seller, SALE.seller, now),
  );
  assert.throws(() =>
    validateBid(
      { ...snapshot, bidder: collector },
      "0.05",
      collector,
      SALE.seller,
      now,
    ),
  );
  for (const state of ["closed", "collected", "scheduled", "ended"])
    assert.throws(() =>
      validateBid({ ...snapshot, state }, "0.05", collector, SALE.seller, now),
    );
  assert.throws(() =>
    validateBid(
      {
        ...snapshot,
        state: "active",
        startTime: now / 1000 - 100,
        endTime: now / 1000 + 1,
      },
      "0.05",
      collector,
      SALE.seller,
      now + 2000,
    ),
  );
  assert.throws(() =>
    validateBid(
      { ...snapshot, minimumWei: "52500000000000000" },
      "0.05",
      collector,
      SALE.seller,
      now,
    ),
  );
});
test("bid calldata selects the native ETH overload with no referrer or increase", () => {
  const encoded = encodeFunctionData({
    abi: AUCTION_ABI,
    functionName: "bid",
    args: [5, false],
  });
  const decoded = decodeFunctionData({ abi: AUCTION_ABI, data: encoded });
  assert.equal(decoded.functionName, "bid");
  assert.deepEqual(decoded.args, [5, false]);
});

test("only the winner can claim after the chain has passed the end time", () => {
  const ended = {
    ...snapshot,
    state: "ended",
    highestWei: "50000000000000000",
    bidder: collector,
    startTime: now / 1000 - 604800,
    endTime: now / 1000 - 1,
  };
  assert.doesNotThrow(() => validateClaim(ended, collector, now));
  assert.throws(() => validateClaim(ended, SALE.seller, now));
  assert.throws(() =>
    validateClaim({ ...ended, state: "active" }, collector, now),
  );
  assert.throws(() =>
    validateClaim({ ...ended, state: "closed" }, collector, now),
  );
  assert.throws(() =>
    validateClaim({ ...ended, highestWei: "0" }, collector, now),
  );
  assert.throws(() =>
    validateClaim({ ...ended, endTime: ended.blockTimestamp }, collector, now),
  );
  assert.throws(() => validateClaim(ended, collector, now + 61000));
});
