import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { type ReactNode } from "react";
import { cookieToInitialState } from "wagmi";
import { Footer } from "@/components/Footer";
import { config } from "../wagmi";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MXJXN",
  description: "Art by Max Jackson",
};

export default function RootLayout(props: { children: ReactNode }) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="min-h-screen flex flex-col justify-between">
          <div className="flex-grow">
            <Providers initialState={initialState}>{props.children}</Providers>
          </div>
            <Footer />
        </div>
      </body>
    </html>
  );
}
