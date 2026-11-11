import type { NextConfig } from "next";

import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

import {
  LEGACY_STYLES,
  resolveStyle,
  SHADCN_BASES,
  SHADCN_STYLES,
} from "./src/registry/config.ts";

const withVarlock = varlockNextConfigPlugin();

// Every style a shadcn/ui project can have, and the build it gets when this
// registry doesn't build that style. `registry:test` serves the build with
// `resolveStyle` too, so it checks these.
const FALLBACKS = [
  ...SHADCN_BASES.flatMap((base) =>
    SHADCN_STYLES.map((style) => `${base}-${style}`),
  ),
  ...LEGACY_STYLES,
].flatMap((style) => {
  const build = resolveStyle(style);
  return build && build !== style ? [{ style, build }] : [];
});

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  async rewrites() {
    return {
      // Runs only when no file in `public/r` matched.
      afterFiles: FALLBACKS.map(({ style, build }) => ({
        source: `/r/${style}/:name.json`,
        destination: `/r/${build}/:name.json`,
      })),
      beforeFiles: [],
      fallback: [],
    };
  },
};

export default withVarlock(nextConfig);
