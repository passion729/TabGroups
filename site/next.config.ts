import type { NextConfig } from "next";

// A static site: `next build` writes plain files to out/ for any static host.
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default config;
