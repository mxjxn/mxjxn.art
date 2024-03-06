"use server"
import React, { Suspense } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { Rankings } from "./Rankings";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

import { RankCheckResponse } from "./types";

interface ApiResponse {
  rankings: RankCheckResponse[];
  time: number; // or string, depending on the format of the timestamp
}

async function getData(): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/api/rank-check`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 60 * 15,
    },
  });
  return await response.json();
}

export default async function RankCheckPage() {
  const rankCheckResults = await getData();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="fixed top-0 w-full p-4 bg-black">
        <div className="w-full flex flex-row-reverse">
          <ConnectButton />
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Rankings data={rankCheckResults} />
      </Suspense>
    </main>
  );
}
