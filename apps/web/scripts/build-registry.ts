// Builds `public/r/{base}-{style}/*.json` for every base and style, the way
// shadcn/ui builds its own registry: compile the `cn-*` markers in each base's
// source with the style's rules, then run `shadcn build` on the compiled copy.
// The CLI handles icons, RTL and the remaining markers when a project installs
// an item, so nothing else is transformed here.
//
//   node scripts/build-registry.ts

import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import { availableParallelism } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { Registry } from "shadcn/schema";
import { transformStyle } from "shadcn/utils";

import {
  BASES,
  DEFAULT_BASE,
  DEFAULT_STYLE,
  STYLES,
  type BaseName,
} from "../src/registry/config.ts";
import { generate } from "./generate.ts";
import {
  CLI_MARKERS,
  ROOT,
  forEachBase,
  getBasePath,
  getItemFiles,
  getMarkers,
  getStyleMaps,
  readRegistry,
  runWithConcurrency,
  type StyleMap,
} from "./registry.ts";

const BUILD_PATH = path.join(ROOT, ".registry");
const OUTPUT_PATH = path.join(ROOT, "public/r");
const SHADCN_BIN = path.join(ROOT, "node_modules/.bin/shadcn");

const run = promisify(execFile);

type Source = { path: string; content: string };

async function readSources(base: BaseName, registry: Registry) {
  const basePath = getBasePath(base);
  const files = [...new Set(registry.items.flatMap(getItemFiles))];
  return Promise.all(
    files.map(async (file): Promise<Source> => ({
      path: file,
      content: await fs.readFile(path.join(basePath, file), "utf8"),
    })),
  );
}

// Fail on what would otherwise only show up after someone installs an item.
function check(base: BaseName, registry: Registry, sources: Source[], defaultMap: StyleMap) {
  const errors: string[] = [];
  const contents = new Map(sources.map((source) => [source.path, source.content]));
  const owners = new Map(
    registry.items.flatMap((item) =>
      getItemFiles(item).map((file) => [file.replace(/\.tsx?$/, ""), item.name]),
    ),
  );

  for (const item of registry.items) {
    for (const file of getItemFiles(item)) {
      const content = contents.get(file)!;

      for (const marker of getMarkers(content)) {
        if (!CLI_MARKERS.has(marker) && !defaultMap[marker]) {
          errors.push(`${file}: ${marker} has no rule in style-${DEFAULT_STYLE}.css`);
        }
      }

      const imports = content.matchAll(
        new RegExp(`["']@/registry/bases/${base}/((?:ui|hooks|lib)/[\\w-]+)["']`, "g"),
      );
      for (const [, imported] of imports) {
        const owner = owners.get(imported!);
        const dependency = owner ? `@${registry.name}/${owner}` : path.basename(imported!);
        if (owner !== item.name && !item.registryDependencies?.includes(dependency)) {
          errors.push(
            `${item.name}: imports ${imported} but doesn't list "${dependency}" in registryDependencies`,
          );
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `The ${base} registry has problems:\n${errors.map((error) => `  - ${error}`).join("\n")}`,
    );
  }
}

async function buildStyle(
  base: BaseName,
  style: string,
  registry: Registry,
  sources: Source[],
  styleMap: StyleMap,
) {
  const name = `${base}-${style}`;
  const buildPath = path.join(BUILD_PATH, name);
  const outputPath = path.join(OUTPUT_PATH, name);

  await Promise.all(
    sources.map(async (source) => {
      const content = source.content.includes("cn-")
        ? await transformStyle(source.content, { styleMap })
        : source.content;
      const file = path.join(buildPath, source.path);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, content);
    }),
  );
  await fs.writeFile(path.join(buildPath, "registry.json"), JSON.stringify(registry, null, 2));

  // File paths in registry.json are relative to the base, so build from the
  // compiled copy of it.
  await run(SHADCN_BIN, ["build", "registry.json", "--cwd", buildPath, "--output", outputPath]);
}

const start = performance.now();

const [registries, styleMaps] = await Promise.all([
  forEachBase(async (base) => {
    const registry = await readRegistry(base);
    return { base, registry, sources: await readSources(base, registry) };
  }),
  getStyleMaps(),
]);

for (const { base, registry, sources } of registries) {
  check(base, registry, sources, styleMaps.get(DEFAULT_STYLE)!);
}

await Promise.all([
  fs.rm(BUILD_PATH, { recursive: true, force: true }),
  fs.rm(OUTPUT_PATH, { recursive: true, force: true }),
]);

const builds = registries.flatMap(({ base, registry, sources }) =>
  STYLES.map(({ name: style }) => ({ base, style, registry, sources })),
);
await runWithConcurrency(
  builds,
  Math.max(1, Math.min(availableParallelism() - 1, 8)),
  async (build) => {
    await buildStyle(
      build.base,
      build.style,
      build.registry,
      build.sources,
      styleMaps.get(build.style)!,
    );
    console.log(`  ${build.base}-${build.style}`);
  },
);

// The default build doubles as the registry's index, for `shadcn search` and
// anything else that reads `/r/registry.json`.
await fs.copyFile(
  path.join(OUTPUT_PATH, `${DEFAULT_BASE}-${DEFAULT_STYLE}`, "registry.json"),
  path.join(OUTPUT_PATH, "registry.json"),
);

await Promise.all([fs.rm(BUILD_PATH, { recursive: true, force: true }), generate()]);

const seconds = ((performance.now() - start) / 1000).toFixed(1);
console.log(`Built ${BASES.length} bases × ${STYLES.length} styles in ${seconds}s.`);
