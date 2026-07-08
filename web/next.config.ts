import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  typedRoutes: true,
  distDir: "next-build",
  outputFileTracingRoot: path.resolve(__dirname, "..")
};

export default nextConfig;
