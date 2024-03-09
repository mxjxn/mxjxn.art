"use client";

import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { RankCheckResponse } from "./types";

function Rankings({
  data,
}: {
  data: {
    rankings: RankCheckResponse[];
    time: number | string;
  };
}) {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { open } = useWeb3Modal();
  return (
    <div className="text-center">
      <h1 className="text-7xl">Subscriber Rankings</h1>
      <h1 className="text-lg mt-4">based on hours remaining in subscription</h1>
      <p className="text-xs mt-2">
        Last updated: {new Date(data.time).toLocaleString()}
      </p>
      <p className="text-xs mb-4">Updates every 15 minutes.</p>

      <div className="p-8">
        <div className="text-xl inline-block">My Rank:</div>
        <div className="text-7xl text-blue-500">
          {address ? (
            data.rankings.find(
              (obj) => obj.address.toLowerCase() === address.toLowerCase()
            )?.rank ?? (
              <p className="text-xl inline-block">
                <a
                  className="underline text-blue-300 hover:text-blue-400"
                  href="https://hypersub.withfabric.xyz/collection/muse-token-10tgfr94805j4"
                >
                  Subscribe first
                </a>
              </p>
            )
          ) : (
            <i className="underline hover:text-blue-200" onClick={() => open()}>
              connect your wallet
            </i>
          )}
        </div>
      </div>

      <table className="text-left">
        <thead className="text-sm text-center">
          <tr>
            <th>Rank</th>
            <th>Address</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {data.rankings.map((ranking) => {
            const hours = ranking.balance;
            return (
              <tr key={ranking.address}>
                <td className="p-4 text-xl font-bold">{ranking.rank}</td>
                <td className="p-4">{ranking.address}</td>
                <td className="p-4">{`${Math.floor(
                  hours / (24 * 30.44)
                )}m ${Math.floor((hours % (24 * 30.44)) / 24)}d ${
                  Math.floor(hours) % 24
                }h`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
export { Rankings };
