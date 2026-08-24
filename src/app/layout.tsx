import "./globals.css";
import type { Metadata } from "next";
import { type ReactNode } from "react";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://mxjxn.art"),
  title: "MXJXN",
  description: "Art by Max Jackson",
  openGraph: {
    title: "MXJXN",
    description: "Art by Max Jackson",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="min-h-screen flex flex-col justify-between">
          <div className="flex-grow">{props.children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
