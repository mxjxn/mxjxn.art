import { NextResponse } from "next/server";
import { readAuction } from "@/lib/auction-client";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    return NextResponse.json(await readAuction(), { headers });
  } catch {
    return NextResponse.json(
      {
        error:
          "Live auction details are temporarily unavailable. Please try again.",
      },
      { status: 503, headers },
    );
  }
}
