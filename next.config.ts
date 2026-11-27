import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    inlineCss: true,
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    const immutableCache = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];
    return [
      { source: "/frames/:path*", headers: immutableCache },
      { source: "/plates/:path*", headers: immutableCache },
      { source: "/fonts/:path*", headers: immutableCache },
      { source: "/images/:path*", headers: immutableCache },
      { source: "/audio/:path*", headers: immutableCache },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/podarunky/shepit-na-vuho",
        destination: "/podarunky/chotyry-nastroi",
        permanent: true,
      },
      {
        source: "/podarunky/sviato-bez-pryvodu",
        destination: "/podarunky/sviato-bez-povodu",
        permanent: true,
      },
      {
        source: "/ru/podarunky/shepot-na-uho",
        destination: "/ru/podarunky/chetyre-nastroeniya",
        permanent: true,
      },
      {
        source: "/images/shokolad-ruchnoy-raboty-harkov-master-aleksandr-nabor-6-konfet.webp-21",
        destination: "/images/shokolad-ruchnoy-raboty-harkov-master-aleksandr-nabor-6-konfet.webp",
        permanent: true,
      },
      {
        source: "/images/shokoladnye-plitki-ruchnoy-raboty-harkov-master-aleksandr-art-bars.webp-14",
        destination: "/images/shokoladnye-plitki-ruchnoy-raboty-harkov-master-aleksandr-art-bars.webp",
        permanent: true,
      },
      {
        source: "/images/shokoladnaya-plitka-ruchnoy-raboty-abstrakciya-makro-chococraft.webp-3",
        destination: "/images/shokoladnaya-plitka-ruchnoy-raboty-abstrakciya-makro-chococraft.webp",
        permanent: true,
      },
      {
        source: "/images/:slug*.webp-:num(\\d+)",
        destination: "/images/:slug*.webp",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
