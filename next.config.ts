import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this project directory.
  // Without this, Turbopack walks up looking for the nearest lockfile and
  // can accidentally pick a parent directory (we previously had a stray
  // empty package-lock.json in /Users/rayonreal/DEV/AI/ that caused
  // Turbopack to watch the entire parent tree, driving CPU to 100%).
  // Hard-pin here makes the dev server immune to future stray lockfiles.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
