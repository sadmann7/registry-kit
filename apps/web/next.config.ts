import type { NextConfig } from "next";

import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

import { BASES, LEGACY_STYLES, resolveStyle } from "./src/registry/config.ts";

const withVarlock = varlockNextConfigPlugin();

// The build a project gets when this registry doesn't build its style: any
// style of a built base, including ones shadcn/ui adds later, and the older
// styles without a base. `registry:test` serves the build with `resolveStyle`
// too, so it checks these.
const FALLBACKS = [
  ...BASES.map(({ name }) => `${name}-:style`),
  ...LEGACY_STYLES,
].flatMap((style) => {
  const build = resolveStyle(style);
  return build ? [{ style, build }] : [];
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
