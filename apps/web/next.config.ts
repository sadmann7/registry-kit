import type { NextConfig } from "next";

import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

import {
  BASES,
  DEFAULT_BASE,
  DEFAULT_STYLE,
  SHADCN_BASES,
} from "./src/registry/config.ts";

const withVarlock = varlockNextConfigPlugin();

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  async rewrites() {
    return {
      // Runs only when no file in `public/r` matched, so it catches styles this
      // registry doesn't build, like `new-york-v4` or `default`. Projects on a
      // base this registry builds get that base, other shadcn/ui bases get a
      // 404, and everything else gets the default base.
      afterFiles: [
        ...BASES.map(({ name }) => ({
          source: `/r/${name}-:style/:name.json`,
          destination: `/r/${name}-${DEFAULT_STYLE}/:name.json`,
        })),
        {
          source: `/r/:style((?!(?:${SHADCN_BASES.join("|")})-)[^/]+)/:name.json`,
          destination: `/r/${DEFAULT_BASE}-${DEFAULT_STYLE}/:name.json`,
        },
      ],
      beforeFiles: [],
      fallback: [],
    };
  },
};

export default withVarlock(nextConfig);
