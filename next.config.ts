import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // 부모 디렉토리(C:\Users\UX_Lab_Live)의 lockfile을 잘못 잡지 않도록 명시
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
