import type { NextConfig } from "next";

import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

import { BASES, DEFAULT_STYLE, SHADCN_BASES } from "./src/registry/config.ts";

const withVarlock = varlockNextConfigPlugin();

// Typed as plain strings, so the check below still compiles when `registry:init`
// has trimmed `BASES` to bases other than Radix.
const BUILT_BASES: readonly string[] = BASES.map(({ name }) => name);

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  async rewrites() {
    return {
      // Runs only when no file in `public/r` matched, so it catches styles this
      // registry doesn't build. Projects on a base this registry builds get
      // that base, and other shadcn/ui bases get a 404. Styles without a base,
      // like `new-york-v4` or `default`, are Radix in shadcn/ui, so they get
      // the Radix build, or a 404 when this registry doesn't build Radix.
      afterFiles: [
        ...BASES.map(({ name }) => ({
          source: `/r/${name}-:style/:name.json`,
          destination: `/r/${name}-${DEFAULT_STYLE}/:name.json`,
        })),
        ...(BUILT_BASES.includes("radix")
          ? [
              {
                source: `/r/:style((?!(?:${SHADCN_BASES.join("|")})-)[^/]+)/:name.json`,
                destination: `/r/radix-${DEFAULT_STYLE}/:name.json`,
              },
            ]
          : []),
      ],
      beforeFiles: [],
      fallback: [],
    };
  },
};

export default withVarlock(nextConfig);
