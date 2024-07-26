import "./globals.css";
import type { Metadata } from "next";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { type ReactNode } from "react";
import { cookieToInitialState } from "wagmi";

import { config } from "../wagmi";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MXJXN",
  description: "Art by Max Jackson",
};

export default function RootLayout(props: { children: ReactNode }) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers initialState={initialState}>
          {props.children}
        </Providers>
      </body>
    </html>
  );
}
