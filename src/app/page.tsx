import { Metadata } from "next";
import { APP_URL } from "@/constants";
import HomePageClient from "./HomePageClient";

export async function generateMetadata(): Promise<Metadata> {
  const ogImageUrl = `${APP_URL}/opengraph-image`;
  
  return {
    title: "MXJXN",
    description: "Art by Max Jackson",
    openGraph: {
      title: "MXJXN",
      description: "Art by Max Jackson",
      images: [ogImageUrl],
    },
  };
}

export default function Home() {
  return <HomePageClient />;
}
