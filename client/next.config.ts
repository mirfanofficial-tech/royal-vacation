import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

/**
 * `resolveAssetUrl()` builds upload URLs against `NEXT_PUBLIC_API_URL`, so the
 * backend origin has to be allow-listed here too — otherwise `next/image`
 * rejects every uploaded image once the API lives anywhere but localhost
 * (e.g. the production api.* domain).
 */
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
  // Produces a minimal .next/standalone server (only the deps actually used
  // at runtime) — what the Docker image copies, instead of the full
  // node_modules tree. See client/Dockerfile.
  output: "standalone",
  transpilePackages: ["@royal-vacation/api-client"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Backend-served uploads (logos, property type images, ...) in local dev.
      { protocol: "http", hostname: "localhost", port: "8090" },
      { protocol: "http", hostname: "localhost", port: "8000" },
      // ...and wherever the backend actually runs in this environment.
      ...backendPattern(),
    ],
  },
};

export default nextConfig;
