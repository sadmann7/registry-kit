// Installs every item into an RTL project for every base and style with
// `shadcn add --dry-run`, against the output of `build-registry.ts`, and checks
// what the CLI would write. Needs network access: items pull shadcn/ui's own
// primitives (like `button`) from ui.shadcn.com.
//
//   node scripts/build-registry.ts && node scripts/test-registry.ts

import type { AddressInfo } from "node:net";

import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { STYLES } from "../src/registry/config.ts";
import {
  forEachBase,
  getItemFiles,
  readRegistry,
  ROOT,
  runWithConcurrency,
} from "./registry.ts";

const OUTPUT_PATH = path.join(ROOT, "public");
const SHADCN_BIN = path.join(ROOT, "node_modules/.bin/shadcn");
const TARGETS: Record<string, string> = {
  "registry:ui": "src/components/ui",
  "registry:hook": "src/hooks",
  "registry:lib": "src/lib",
};

const run = promisify(execFile);

const server = createServer(async (request, response) => {
  const file = path.join(
    OUTPUT_PATH,
    path.normalize(decodeURIComponent(request.url!.split("?")[0])),
  );
  const content = file.startsWith(OUTPUT_PATH)
    ? await fs.readFile(file).catch(() => null)
    : null;
  response.writeHead(content ? 200 : 404, {
    "content-type": "application/json",
  });
  response.end(content);
});
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const registryUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/r/{style}/{name}.json`;

const fixtures = await fs.mkdtemp(path.join(os.tmpdir(), "registry-test-"));

async function createFixture(style: string, namespace: string) {
  const dir = path.join(fixtures, style);
  await fs.mkdir(path.join(dir, "src/app"), { recursive: true });
  await Promise.all([
    fs.writeFile(
      path.join(dir, "package.json"),
      JSON.stringify({ name: "fixture", private: true }),
    ),
    fs.writeFile(
      path.join(dir, "src/app/globals.css"),
      '@import "tailwindcss";\n',
    ),
    fs.writeFile(
      path.join(dir, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }),
    ),
    fs.writeFile(
      path.join(dir, "components.json"),
      JSON.stringify({
        style,
        rsc: true,
        tsx: true,
        rtl: true,
        iconLibrary: "lucide",
        tailwind: {
          config: "",
          css: "src/app/globals.css",
          baseColor: "neutral",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          ui: "@/components/ui",
          utils: "@/lib/utils",
          lib: "@/lib",
          hooks: "@/hooks",
        },
        registries: { [`@${namespace}`]: registryUrl },
      }),
    ),
  ]);
  return dir;
}

const failures: string[] = [];
let count = 0;

try {
  const cases = (
    await forEachBase(async (base) => {
      const registry = await readRegistry(base);
      return STYLES.map(({ name }) => ({ style: `${base}-${name}`, registry }));
    })
  ).flat();

  await runWithConcurrency(cases, 4, async ({ style, registry }) => {
    const cwd = await createFixture(style, registry.name);

    for (const item of registry.items) {
      for (const file of getItemFiles(item)) {
        const target = `${TARGETS[item.type] ?? "src/components"}/${path.basename(file)}`;
        const label = `${style} @${registry.name}/${item.name} → ${target}`;
        count++;

        try {
          const { stdout } = await run(
            SHADCN_BIN,
            [
              "add",
              `@${registry.name}/${item.name}`,
              "--dry-run",
              "--view",
              target,
              "--cwd",
              cwd,
            ],
            { maxBuffer: 16 * 1024 * 1024 },
          );
          const problems = [
            !stdout.includes(target) && "file missing from the install",
            /\bcn-[a-z]/.test(stdout) && "unresolved cn-* marker",
            stdout.includes("@/registry/") && "unresolved @/registry import",
          ].filter(Boolean);
          if (problems.length > 0)
            failures.push(`${label}: ${problems.join(", ")}\n${stdout}`);
        } catch (error) {
          const { stdout = "", stderr = "" } = error as {
            stdout?: string;
            stderr?: string;
          };
          failures.push(`${label}: shadcn add failed\n${stdout}${stderr}`);
        }
      }
    }
    console.log(`  ${style}`);
  });
} finally {
  server.close();
  await fs.rm(fixtures, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(
    `\n${failures.length} of ${count} installs failed:\n\n${failures.join("\n\n")}`,
  );
  process.exit(1);
}
console.log(`All ${count} installs passed.`);
