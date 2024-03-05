import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { stpAbi } from "@/abis/stp_abi";
import { NextResponse, NextRequest } from "next/server";

const client = createPublicClient({
  chain: base,
  transport: http(
    "https://base-mainnet.g.alchemy.com/v2/kZuPuOWS-x394yqiIZYKAXUg3jxc7cxW"
  ),
});

const museContract = {
  address: "3B3b7B66ADf6950A7Fc47155712e7e85381B507b",
  abi: stpAbi,
};

async function getTimeBalances() {
  const supplyDetail: any = await client.readContract({
    address: `0x${museContract.address}`,
    abi: museContract.abi,
    functionName: "supplyDetail",
  });
  // coerce supplyDetail[0] to number to avoid issues with arithmetic
  const supplyDetail0 = Number(supplyDetail[0]);
  const totalSupply = Number(supplyDetail0);

  const balances: { [key: string]: number } = {};
  for (let i = 1; i <= totalSupply; i++) {
    const owner: any = await client.readContract({
      address: `0x${museContract.address}`,
      abi: museContract.abi,
      functionName: "ownerOf",
      args: [i],
    });
    console.log("owner", owner);
    const balance = await client.readContract({
      address: `0x${museContract.address}`,
      abi: museContract.abi,
      functionName: "balanceOf",
      args: [owner],
    });
    console.log("balance", balance);
    const balanceInHours = Number(balance) / 60 / 60;
    // coerce owner to string to avoid issues with object keys
    const ownerString = owner.toString();
    balances[ownerString] = balanceInHours;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return balances;
}

async function getRankings() {
  const balances = await getTimeBalances();
  const sortedBalances = Object.entries(balances).sort((a, b) => b[1] - a[1]);

  const rankings = sortedBalances.map(([address, balance], index) => {
    return {
      address,
      balance,
      rank: index + 1,
    };
  });
  console.log({ rankings });
  const filteredRankings = rankings.filter((ranking) => ranking.balance > 0);
  return filteredRankings;
}

export async function GET(request: Request) {
  console.log("GET /api/rank-check");
  const rankings = await getRankings();
  console.log("got rankings");

  return NextResponse.json({ rankings, time: new Date().toISOString() });
}

export const dynamic = "force-dynamic"