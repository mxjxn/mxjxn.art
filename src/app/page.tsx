"use client";

import Link from "next/link";
import SubscriptionStatus from "@/components/subscriptionStatus";

function App() {
  return (
    <div>
      <div className="flex flex-row">
        <div className="px-4 w-128 flex flex-col items-start gap-8">
          <Link href="/subscribe">
            <div className="lg:text-8xl text-5xl py-4">
              Muse Studio is an art subscription service.
            </div>
          </Link>
          <SubscriptionStatus />
        </div>
      </div>
    </div>
  );
}

export default App;
