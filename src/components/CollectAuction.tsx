"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  WagmiProvider,
  createConfig,
  http,
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
  type Connector,
} from "wagmi";
import { injected } from "wagmi";
import { mainnet } from "wagmi/chains";
import {
  BaseError,
  formatEther,
  parseAbi,
  parseEventLogs,
  type Hex,
} from "viem";
import { AUCTION_ABI, SALE } from "@/lib/auction-contract";
import { ethereum } from "@/lib/auction-client";
import {
  validateBid,
  validateClaim,
  type SaleSnapshot,
} from "@/lib/sale-state";

const config = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  ssr: true,
  transports: {
    [mainnet.id]: http("https://ethereum-rpc.publicnode.com", {
      timeout: 12000,
    }),
  },
});
const bidEvents = parseAbi([
  "event BidEvent(uint40 indexed listingId, address referrer, address bidder, uint256 amount)",
]);
const transferEvents = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);
const eth = (amount: string) => formatEther(BigInt(amount));
const shortAddress = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`;
function friendlyError(error: unknown) {
  const text =
    error instanceof BaseError
      ? error.shortMessage
      : error instanceof Error
        ? error.message
        : "";
  if (/reject|denied|cancelled|canceled/i.test(text))
    return "Cancelled in your wallet. No transaction was submitted here.";
  if (/insufficient/i.test(text))
    return "Your wallet needs enough ETH for the bid and network fees.";
  return (
    text || "The bid could not be prepared. Refresh the auction and try again."
  );
}
async function fetchAuction() {
  const response = await fetch("/api/collect", { cache: "no-store" });
  if (!response.ok)
    throw new Error(
      "Live auction details are temporarily unavailable. Please try again.",
    );
  return (await response.json()) as SaleSnapshot;
}
function duration(seconds: number) {
  if (seconds % 86400 === 0) return `${seconds / 86400}-day`;
  if (seconds % 3600 === 0) return `${seconds / 3600}-hour`;
  return `${Math.ceil(seconds / 60)}-minute`;
}
function Auction() {
  const { address, chainId, isConnected } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [snapshot, setSnapshot] = useState<SaleSnapshot | null>(null);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [modal, setModal] = useState<"wallet" | "review" | "claim" | null>(
    null,
  );
  const [wallets, setWallets] = useState<Connector[]>([]);
  const [busy, setBusy] = useState(false);
  const [hash, setHash] = useState<Hex>();
  const [submitted, setSubmitted] = useState<{
    kind: "bid" | "claim";
    address: string;
    amount: bigint;
  } | null>(null);
  const [result, setResult] = useState("");
  const [now, setNow] = useState(Date.now());
  const polling = useRef(false);
  const handled = useRef<Hex | undefined>(undefined);
  const receipt = useWaitForTransactionReceipt({
    hash,
    chainId: mainnet.id,
    confirmations: 1,
  });
  const pending = !!hash && !receipt.data;
  const refresh = useCallback(async () => {
    if (polling.current) return;
    polling.current = true;
    try {
      const data = await fetchAuction();
      setSnapshot(data);
      setLoadError("");
      setAmount((value) => value || eth(data.minimumWei));
    } catch (err) {
      setSnapshot(null);
      setLoadError(friendlyError(err));
    } finally {
      polling.current = false;
    }
  }, []);
  useEffect(() => {
    void refresh();
    const poll = () => {
      if (!document.hidden) void refresh();
    };
    const interval = setInterval(poll, 15000);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    document.addEventListener("visibilitychange", poll);
    return () => {
      clearInterval(interval);
      clearInterval(clock);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [refresh]);
  useEffect(() => {
    let stopped = false;
    void Promise.all(
      connectors.map(async (connector) => {
        try {
          return (await connector.getProvider()) ? connector : null;
        } catch {
          return null;
        }
      }),
    ).then((available) => {
      if (!stopped)
        setWallets(
          available.filter((item): item is Connector => item !== null),
        );
    });
    return () => {
      stopped = true;
    };
  }, [connectors]);
  useEffect(() => {
    setModal(null);
    setError("");
  }, [address, chainId]);
  useEffect(() => {
    if (
      !receipt.data ||
      !submitted ||
      handled.current === receipt.data.transactionHash
    )
      return;
    handled.current = receipt.data.transactionHash;
    const confirmed =
      receipt.data.status === "success" &&
      (submitted.kind === "claim"
        ? parseEventLogs({ abi: transferEvents, logs: receipt.data.logs }).some(
            (event) =>
              event.address.toLowerCase() === SALE.token &&
              event.args.tokenId === SALE.tokenId &&
              event.args.to.toLowerCase() === submitted.address.toLowerCase(),
          )
        : parseEventLogs({ abi: bidEvents, logs: receipt.data.logs }).some(
            (event) =>
              event.address.toLowerCase() === SALE.marketplace &&
              event.args.listingId === SALE.listingId &&
              event.args.bidder.toLowerCase() ===
                submitted.address.toLowerCase() &&
              event.args.amount === submitted.amount,
          ));
    setResult(
      confirmed
        ? submitted.kind === "claim"
          ? "Respiration has been transferred to your wallet."
          : "Your bid is confirmed on Ethereum."
        : "This transaction did not complete the requested action. Check its details before trying again.",
    );
    void refresh();
  }, [receipt.data, submitted, refresh]);

  const stale = !snapshot || now - snapshot.checkedAt > 60000;
  const expired =
    !!snapshot &&
    snapshot.startTime !== 0 &&
    snapshot.endTime <=
      snapshot.blockTimestamp + Math.max(0, now - snapshot.checkedAt) / 1000;
  const accepting =
    !stale &&
    !expired &&
    (snapshot?.state === "ready" || snapshot?.state === "active");
  const owner = address?.toLowerCase() === SALE.seller;
  const leading =
    !!address && address.toLowerCase() === snapshot?.bidder.toLowerCase();
  const title =
    snapshot?.state === "collected"
      ? "Collected"
      : snapshot?.state === "closed"
        ? "Sale closed"
        : snapshot?.state === "ended" || expired
          ? "Auction ended"
          : snapshot?.state === "scheduled"
            ? "Upcoming auction"
            : snapshot?.state === "active"
              ? "Auction in progress"
              : "Reserve auction";
  async function connect(connector: Connector) {
    setBusy(true);
    setError("");
    try {
      await connectAsync({ connector });
      setModal(null);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }
  async function review(kind: "bid" | "claim" = "bid") {
    if (!address) {
      setModal("wallet");
      return;
    }
    setBusy(true);
    setError("");
    setResult("");
    try {
      if (chainId !== mainnet.id)
        await switchChainAsync({ chainId: mainnet.id });
      const fresh = await fetchAuction();
      setSnapshot(fresh);
      if (kind === "claim") validateClaim(fresh, address);
      else validateBid(fresh, amount, address, SALE.seller);
      setModal(kind === "claim" ? "claim" : "review");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!address || chainId !== mainnet.id || busy || pending) return;
    setBusy(true);
    setError("");
    try {
      // Re-read and simulate immediately before asking the collector's wallet to sign.
      const fresh = await fetchAuction();
      setSnapshot(fresh);
      if (modal === "claim") {
        validateClaim(fresh, address);
        await ethereum.simulateContract({
          address: SALE.marketplace,
          abi: AUCTION_ABI,
          functionName: "finalize",
          args: [SALE.listingId],
          account: address,
          value: 0n,
        });
        const transaction = await writeContractAsync({
          address: SALE.marketplace,
          abi: AUCTION_ABI,
          functionName: "finalize",
          args: [SALE.listingId],
          account: address,
          chainId: mainnet.id,
          value: 0n,
        });
        setSubmitted({ kind: "claim", address, amount: 0n });
        setHash(transaction);
        setResult("");
        setModal(null);
        return;
      }
      const value = validateBid(fresh, amount, address, SALE.seller);
      await ethereum.simulateContract({
        address: SALE.marketplace,
        abi: AUCTION_ABI,
        functionName: "bid",
        args: [SALE.listingId, false],
        account: address,
        value,
      });
      const transaction = await writeContractAsync({
        address: SALE.marketplace,
        abi: AUCTION_ABI,
        functionName: "bid",
        args: [SALE.listingId, false],
        account: address,
        chainId: mainnet.id,
        value,
      });
      setSubmitted({ kind: "bid", address, amount: value });
      setHash(transaction);
      setResult("");
      setModal(null);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="sale-auction" aria-label="Respiration auction">
      <p className="sale-eyebrow">{snapshot ? title : "Auction details"}</p>
      {snapshot ? (
        <>
          <p className="sale-price">
            {eth(
              snapshot.highestWei !== "0"
                ? snapshot.highestWei
                : snapshot.reserveWei,
            )}{" "}
            <span>ETH</span>
          </p>
          <p className="sale-caption">
            {snapshot.highestWei !== "0" ? "Highest bid" : "Reserve price"} ·
            Ethereum
          </p>
          <p className="sale-timing">
            {snapshot.state === "ready"
              ? `A ${duration(snapshot.endTime)} auction begins with the first qualifying bid.`
              : snapshot.state === "active" || snapshot.state === "scheduled"
                ? `${snapshot.state === "scheduled" ? "Starts" : "Ends"} ${new Date((snapshot.state === "scheduled" ? snapshot.startTime : snapshot.endTime) * 1000).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.`
                : snapshot.state === "ended"
                  ? "Bidding has ended."
                  : "This auction is no longer accepting bids."}
          </p>
          {snapshot.extensionSeconds > 0 && (
            <p className="sale-caption">
              Late bids can extend the auction by{" "}
              {Math.ceil(snapshot.extensionSeconds / 60)} minutes.
            </p>
          )}
          {stale && (
            <p className="sale-message" role="status">
              Refreshing auction details…
            </p>
          )}
        </>
      ) : (
        <p className="sale-message" role="status">
          {loadError || "Checking the auction on Ethereum…"}
        </p>
      )}
      {loadError && (
        <button className="sale-text-button" onClick={() => void refresh()}>
          Try again
        </button>
      )}
      {accepting && !pending && !owner && !leading && !isConnected && (
        <button
          className="sale-primary"
          onClick={() => void review()}
          disabled={busy}
        >
          Connect to bid <span aria-hidden="true">↗</span>
        </button>
      )}
      {accepting && !pending && !owner && !leading && isConnected && (
        <form
          className="bid-form"
          onSubmit={(event) => {
            event.preventDefault();
            void review();
          }}
        >
          <label htmlFor="bid-amount">
            Your bid <span>ETH</span>
          </label>
          <input
            id="bid-amount"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={busy}
            aria-describedby="bid-minimum"
          />
          <p id="bid-minimum" className="sale-caption">
            Minimum {eth(snapshot!.minimumWei)} ETH · network fees additional
          </p>
          <button className="sale-primary" type="submit" disabled={busy}>
            {busy
              ? "Preparing…"
              : !isConnected
                ? "Connect wallet"
                : chainId !== mainnet.id
                  ? "Switch to Ethereum"
                  : "Review bid"}
          </button>
        </form>
      )}
      {owner && accepting && (
        <p className="sale-message">
          You’re connected as the artist. Collectors can bid here from their own
          wallets.
        </p>
      )}
      {leading && accepting && (
        <p className="sale-message">You currently hold the highest bid.</p>
      )}
      {!stale &&
        snapshot?.state === "ended" &&
        snapshot.highestWei !== "0" &&
        !pending &&
        (!isConnected ? (
          <button className="sale-primary" onClick={() => setModal("wallet")}>
            Connect winning wallet
          </button>
        ) : leading ? (
          <button
            className="sale-primary"
            onClick={() => void review("claim")}
            disabled={busy}
          >
            {busy ? "Preparing…" : "Claim artwork"}
          </button>
        ) : (
          <p className="sale-message">
            The winning collector can claim this artwork from their wallet.
          </p>
        ))}
      {isConnected && address && (
        <div className="sale-wallet">
          <span>{shortAddress(address)}</span>
          <button onClick={() => disconnect()} disabled={busy || pending}>
            Disconnect
          </button>
        </div>
      )}
      {pending && (
        <p className="sale-message" role="status">
          {receipt.error
            ? "Confirmation is taking longer than expected. Check your transaction below."
            : "Your transaction has been submitted. Waiting for Ethereum confirmation…"}
        </p>
      )}
      {pending && receipt.error && (
        <button
          className="sale-text-button"
          onClick={() => void receipt.refetch()}
        >
          Check confirmation
        </button>
      )}
      {result && (
        <p className="sale-message" role="status">
          {result}
        </p>
      )}
      {hash && (
        <a
          className="sale-text-button"
          href={`https://etherscan.io/tx/${receipt.data?.transactionHash || hash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View transaction ↗
        </a>
      )}
      {error && !modal && (
        <p className="sale-error" role="alert">
          {error}
        </p>
      )}
      <Dialog
        open={modal !== null}
        onClose={() => {
          if (!busy) {
            setModal(null);
            setError("");
          }
        }}
        transition
        className="sale-dialog"
      >
        <DialogPanel className="sale-dialog-panel">
          <div className="sale-dialog-heading">
            <DialogTitle>
              {modal === "wallet"
                ? "Connect a wallet"
                : modal === "claim"
                  ? "Claim Respiration"
                  : "Review your bid"}
            </DialogTitle>
            <button
              aria-label="Close"
              onClick={() => setModal(null)}
              disabled={busy}
            >
              ×
            </button>
          </div>
          {modal === "wallet" ? (
            <>
              <p>Choose an Ethereum wallet to collect Respiration.</p>
              {wallets.length ? (
                wallets.map((wallet) => (
                  <button
                    className="sale-primary"
                    key={wallet.uid}
                    onClick={() => void connect(wallet)}
                    disabled={busy}
                  >
                    {busy ? "Connecting…" : wallet.name}
                  </button>
                ))
              ) : (
                <p className="sale-message">
                  No wallet was detected. Open this page in your wallet’s
                  browser, or use an Ethereum browser wallet.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="sale-review-title">Respiration</p>
              <p className="sale-price">
                {modal === "claim" && snapshot
                  ? eth(snapshot.highestWei)
                  : amount}{" "}
                <span>ETH</span>
              </p>
              <p>
                {modal === "claim"
                  ? "Your winning bid is already held by the auction. Confirming transfers the artwork to your wallet. Only network fees are required."
                  : "Your wallet will ask you to confirm this bid on Ethereum mainnet. Network fees are additional."}
              </p>
              <button
                className="sale-primary"
                onClick={() => void submit()}
                disabled={busy || pending}
              >
                {busy ? "Check your wallet…" : "Confirm in wallet"}
              </button>
            </>
          )}
          {error && (
            <p className="sale-error" role="alert">
              {error}
            </p>
          )}
        </DialogPanel>
      </Dialog>
    </div>
  );
}
export function CollectAuction() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Auction />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
