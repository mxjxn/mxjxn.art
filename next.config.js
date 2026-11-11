/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: {
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "arweave.net" },
      { protocol: "https", hostname: "ipfs.io", pathname: "/ipfs/**" },
      { protocol: "https", hostname: "imagedelivery.net" },
      { protocol: "https", hostname: "raw2.seadn.io" },
      { protocol: "https", hostname: "i.seadn.io" },
      { protocol: "https", hostname: "openseauserdata.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "stream.farcaster.xyz" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/series/render-till-december",
        destination: "/series/100-days-of-blender",
        permanent: true,
      },
      {
        source: "/art/muse-editions-61",
        destination: "/wheelgen",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/wheelgen/app", destination: "/wheelgen/app/index.html" },
      { source: "/wheelgen/app/", destination: "/wheelgen/app/index.html" },
    ];
  },
};
module.exports = nextConfig;
