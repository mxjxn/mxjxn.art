import type { Metadata } from "next";
import { type ReactNode } from "react";

export const metadata: Metadata = {
  title: "MXJXN:ART",
  description: "Selected Artworks by Max Jackson",
};

export default function RootLayout(props: { children: ReactNode }) {
  return <div>{props.children}</div>;
}
/*
      <script
        src="https://marketplace.manifoldxyz.dev/3.5.13/marketplace.umd.min.js"
        async
      ></script>
      <link
        rel="stylesheet"
        href="https://marketplace.manifoldxyz.dev/3.5.13/marketplace.css"
      />
*/
