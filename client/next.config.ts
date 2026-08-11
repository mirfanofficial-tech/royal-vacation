import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@royal-vacation/api-client"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Backend-served uploads (logos, property type images, ...).
      { protocol: "http", hostname: "localhost", port: "8090" },
      { protocol: "http", hostname: "localhost", port: "8000" },
    ],
  },
};

export default nextConfig;
