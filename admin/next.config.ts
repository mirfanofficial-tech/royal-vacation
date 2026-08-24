import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@royal-vacation/api-client"],
};

export default nextConfig;
