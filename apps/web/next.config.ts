import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";
import type { NextConfig } from "next";

import { DEFAULT_STYLE } from "./src/registry/config.ts";

const withVarlock = varlockNextConfigPlugin();

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  async rewrites() {
    return {
      // Runs only when no file in `public/r` matched, so it catches styles this
      // registry doesn't build, like `new-york-v4` or `default`. Base UI
      // projects get the Base UI build; everything else is Radix.
      afterFiles: [
        { source: "/r/base-:style/:name.json", destination: `/r/base-${DEFAULT_STYLE}/:name.json` },
        { source: "/r/:style/:name.json", destination: `/r/radix-${DEFAULT_STYLE}/:name.json` },
      ],
      beforeFiles: [],
      fallback: [],
    };
  },
};

export default withVarlock(nextConfig);
