import { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "MXJXN",
  description: "Art by Max Jackson",
};

export default function Home() {
  return <HomePageClient />;
}
