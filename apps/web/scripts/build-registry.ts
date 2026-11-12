// Builds `public/r/{base}-{style}/*.json` for every base and style, the way
// shadcn/ui builds its own registry: compile the `cn-*` markers in each base's
// source with the style's rules, then run `shadcn build` on the compiled copy.
// The CLI handles icons, RTL and the remaining markers when a project installs
// an item, so nothing else is transformed here.
//
//   node scripts/build-registry.ts

import type { Registry } from "shadcn/schema";

import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import { isBuiltin } from "node:module";
import { availableParallelism } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { transformStyle } from "shadcn/utils";

import {
  type BaseName,
  BASES,
  DEFAULT_BASE,
  DEFAULT_STYLE,
  STYLES,
} from "../src/registry/config.ts";
import { generate } from "./generate.ts";
import {
  CLI_MARKERS,
  forEachBase,
  getBasePath,
  getItemFiles,
  getMarkers,
  getOwnStyleMaps,
  getRegistryImports,
  getStyleMaps,
  getUncompiledMarkers,
  readRegistry,
  REGISTRY_PATH,
  ROOT,
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

// Packages every project has, which items don't list in `dependencies`.
const HOST_PACKAGES = new Set(["react", "react-dom", "next"]);

function getPackageImports(source: string) {
  const packages = new Set<string>();
  for (const [, specifier] of source.matchAll(
    /\b(?:from|import)\s*\(?\s*["']([^"']+)["']/g,
  )) {
    if (/^(?:\.|@\/|#|node:)/.test(specifier) || isBuiltin(specifier)) continue;
    const parts = specifier.split("/");
    packages.add(
      specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0],
    );
  }
  return packages;
}

// Fail on what would otherwise only show up after someone installs an item.
function checkBase(
  base: BaseName,
  registry: Registry,
  sources: Source[],
  defaultMap: StyleMap,
  synced: Set<string>,
) {
  const errors: string[] = [];
  const contents = new Map(
    sources.map((source) => [source.path, source.content]),
  );
  const owners = new Map(
    registry.items.flatMap((item) =>
      getItemFiles(item).map((file) => [
        file.replace(/\.tsx?$/, ""),
        item.name,
      ]),
    ),
  );

  // Dependencies on the registry's own items become URLs under it.
  if (!/^https?:\/\/[^/]+$/.test(registry.homepage)) {
    errors.push(
      `homepage must be the origin the registry is served from, like https://acme.com, not "${registry.homepage}"`,
    );
  }
  const names = new Set(registry.items.map((item) => item.name));

  for (const item of registry.items) {
    for (const dependency of item.registryDependencies ?? []) {
      const prefix = `@${registry.name}/`;
      if (
        dependency.startsWith(prefix) &&
        !names.has(dependency.slice(prefix.length))
      ) {
        errors.push(
          `${item.name}: depends on ${dependency}, which isn't an item`,
        );
      }
    }

    // Listed with or without a version, like `zod` or `zod@^4`.
    const dependencies = new Set(
      (item.dependencies ?? []).map((dependency) =>
        dependency.replace(/(?<=.)@.*$/, ""),
      ),
    );

    for (const file of getItemFiles(item)) {
      const content = contents.get(file)!;

      for (const marker of getMarkers(content)) {
        if (!CLI_MARKERS.has(marker) && !defaultMap[marker]) {
          errors.push(
            `${file}: ${marker} has no rule in style-${DEFAULT_STYLE}.css`,
          );
        }
      }

      for (const name of getPackageImports(content)) {
        if (!HOST_PACKAGES.has(name) && !dependencies.has(name)) {
          errors.push(
            `${item.name}: imports ${name} but doesn't list it in dependencies`,
          );
        }
      }

      for (const imported of getRegistryImports(content, base)) {
        const owner = owners.get(imported);
        if (owner === item.name) continue;
        // Primitives synced from shadcn/ui install by their name.
        const dependency = owner
          ? `@${registry.name}/${owner}`
          : synced.has(imported)
            ? path.basename(imported)
            : null;
        if (dependency === null) {
          errors.push(
            `${item.name}: imports ${imported}, which no item publishes and shadcn/ui doesn't provide. Add it to an item, or run pnpm registry:sync if it's a shadcn/ui primitive.`,
          );
        } else if (!item.registryDependencies?.includes(dependency)) {
          errors.push(
            `${item.name}: imports ${imported} but doesn't list "${dependency}" in registryDependencies`,
          );
        }
      }
    }
  }

  return errors.map((error) => `${base}: ${error}`);
}

// Every base serves the same registry, so a project gets the same items
// whichever base it's on.
function checkBases(registries: { base: BaseName; registry: Registry }[]) {
  const errors: string[] = [];
  const [first, ...rest] = registries;
  if (!first) return errors;
  const items = new Set(first.registry.items.map((item) => item.name));

  for (const { base, registry } of rest) {
    for (const key of ["name", "homepage"] as const) {
      if (registry[key] !== first.registry[key]) {
        errors.push(
          `${base}: ${key} is "${registry[key]}" but ${first.base} has "${first.registry[key]}"`,
        );
      }
    }
    const names = new Set(registry.items.map((item) => item.name));
    for (const name of items.difference(names))
      errors.push(`${base}: missing ${name}, which ${first.base} has`);
    for (const name of names.difference(items))
      errors.push(`${first.base}: missing ${name}, which ${base} has`);
  }
  return errors;
}

// A rule for a marker no item uses never applies, which usually means a typo
// in its name, so the default style's rule shows instead.
function checkStyles(ownMaps: Map<string, StyleMap>, sources: Source[][]) {
  const used = new Set(
    sources.flat().flatMap((source) => [...getMarkers(source.content)]),
  );
  return [...ownMaps].flatMap(([style, styleMap]) =>
    Object.keys(styleMap)
      .filter((marker) => !used.has(marker))
      .map(
        (marker) =>
          `styles/style-${style}.css: .${marker} isn't used by any item`,
      ),
  );
}

// `transformStyle` only rewrites a marker written as a plain string in
// `className`, `cn()` or `cva()`. One left behind is styled in the preview
// and dropped by the CLI on install.
async function checkCompiled(
  base: BaseName,
  sources: Source[],
  styleMap: StyleMap,
) {
  const errors = await Promise.all(
    sources.map(async (source) => {
      if (!source.content.includes("cn-")) return [];
      const compiled = await transformStyle(source.content, { styleMap });
      return getUncompiledMarkers(compiled).map(
        (marker) =>
          `${base}: ${source.path}: ${marker} can't be compiled where it's written. Write it as a plain string in className, a cn() argument, or a cva() base or variant, not in a condition, a variable or compoundVariants.`,
      );
    }),
  );
  return errors.flat();
}

async function readSynced(base: BaseName) {
  const lock: { files: string[] } = JSON.parse(
    await fs.readFile(path.join(REGISTRY_PATH, "shadcn.json"), "utf8"),
  );
  const prefix = `bases/${base}/`;
  return new Set(
    lock.files
      .filter((file) => file.startsWith(prefix))
      .map((file) => file.slice(prefix.length).replace(/\.tsx?$/, "")),
  );
}

// Points dependencies on the registry's own items, like `@acme/format`, at
// their URL in the same build. Projects then install them whatever namespace
// they gave the registry, or with none when they add an item by URL.
function withItemUrls(registry: Registry, build: string): Registry {
  const prefix = `@${registry.name}/`;
  return {
    ...registry,
    items: registry.items.map((item) =>
      item.registryDependencies
        ? {
            ...item,
            registryDependencies: item.registryDependencies.map((dependency) =>
              dependency.startsWith(prefix)
                ? `${registry.homepage}/r/${build}/${dependency.slice(prefix.length)}.json`
                : dependency,
            ),
          }
        : item,
    ),
  };
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
  await fs.mkdir(buildPath, { recursive: true });
  await fs.writeFile(
    path.join(buildPath, "registry.json"),
    JSON.stringify(withItemUrls(registry, name), null, 2),
  );

  // File paths in registry.json are relative to the base, so build from the
  // compiled copy of it.
  await run(SHADCN_BIN, [
    "build",
    "registry.json",
    "--cwd",
    buildPath,
    "--output",
    outputPath,
  ]);
}

const start = performance.now();

const [registries, styleMaps, ownStyleMaps] = await Promise.all([
  forEachBase(async (base) => {
    const registry = await readRegistry(base);
    return {
      base,
      registry,
      sources: await readSources(base, registry),
      synced: await readSynced(base),
    };
  }),
  getStyleMaps(),
  getOwnStyleMaps(),
]);

const errors = [
  ...checkBases(registries),
  ...registries.flatMap(({ base, registry, sources, synced }) =>
    checkBase(base, registry, sources, styleMaps.get(DEFAULT_STYLE)!, synced),
  ),
  ...checkStyles(
    ownStyleMaps,
    registries.map(({ sources }) => sources),
  ),
  ...(
    await Promise.all(
      registries.map(({ base, sources }) =>
        checkCompiled(base, sources, styleMaps.get(DEFAULT_STYLE)!),
      ),
    )
  ).flat(),
];
if (errors.length > 0) {
  console.error(
    `The registry has problems:\n${errors.map((error) => `  - ${error}`).join("\n")}`,
  );
  process.exit(1);
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

await Promise.all([
  fs.rm(BUILD_PATH, { recursive: true, force: true }),
  generate(),
]);

const seconds = ((performance.now() - start) / 1000).toFixed(1);
console.log(
  `Built ${BASES.length} bases × ${STYLES.length} styles in ${seconds}s.`,
);
