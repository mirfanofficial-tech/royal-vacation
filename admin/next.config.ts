import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

/** Same reasoning as client/next.config.ts — allow-list wherever the API
 * actually runs (uploaded logos, property images, ...) instead of only
 * localhost. */
function backendPattern(): RemotePattern[] {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];
  try {
    const { protocol, hostname, port } = new URL(apiUrl);
    return [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        ...(port ? { port } : {}),
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  // See client/next.config.ts for why — minimal server for the Docker image.
  output: "standalone",
  transpilePackages: ["@royal-vacation/api-client"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8090" },
      { protocol: "http", hostname: "localhost", port: "8000" },
      ...backendPattern(),
    ],
  },
};

export default nextConfig;
