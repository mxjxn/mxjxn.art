import "./globals.css";
import type { Metadata } from "next";
import { type ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  metadataBase: new URL("https://mxjxn.art"),
  title: { default: "MXJXN — Art by Max Jackson", template: "%s — MXJXN" },
  description:
    "Calligraphic forms, digital spaces, and moving images. Art by Max Jackson.",
  openGraph: {
    title: "MXJXN",
    description: "Art by Max Jackson",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        {props.children}
        <Footer />
      </body>
    </html>
  );
}
