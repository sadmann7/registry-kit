// `next dev`, plus regenerating the preview's styles and icons when the
// registry changes.

import { spawn } from "node:child_process";
import path from "node:path";

import { watchRegistry } from "./generate.ts";
import { ROOT } from "./registry.ts";

watchRegistry();

const next = spawn(
  path.join(ROOT, "node_modules/.bin/next"),
  ["dev", ...process.argv.slice(2)],
  {
    stdio: "inherit",
  },
);
next.on("exit", (code) => process.exit(code ?? 0));
