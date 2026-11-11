import { promises as fs } from "node:fs";
import path from "node:path";
import { type Registry, registrySchema } from "shadcn/schema";
import { createStyleMap } from "shadcn/utils";

import {
  type BaseName,
  BASES,
  DEFAULT_STYLE,
  type StyleName,
  STYLES,
} from "../src/registry/config.ts";

export type StyleMap = Record<string, string>;

export const ROOT = path.resolve(import.meta.dirname, "..");
export const REGISTRY_PATH = path.join(ROOT, "src/registry");
export const STYLES_PATH = path.join(REGISTRY_PATH, "styles");
export const GENERATED_PATH = path.join(REGISTRY_PATH, "__generated__");

// Markers the shadcn CLI resolves at install time from the project's
// components.json, so they stay in the published source.
export const CLI_MARKERS = new Set([
  "cn-font-heading",
  "cn-logical-sides",
  "cn-menu-target",
  "cn-menu-translucent",
  "cn-rtl-flip",
]);

export function getBasePath(base: BaseName) {
  return path.join(REGISTRY_PATH, "bases", base);
}

export async function readRegistry(base: BaseName): Promise<Registry> {
  const file = path.join(getBasePath(base), "registry.json");
  const result = registrySchema.safeParse(
    JSON.parse(await fs.readFile(file, "utf8")),
  );
  if (!result.success) {
    throw new Error(
      `Invalid ${path.relative(ROOT, file)}:\n${result.error.message}`,
    );
  }
  return result.data;
}

export function getItemFiles(item: Registry["items"][number]) {
  return (item.files ?? []).map((file) =>
    typeof file === "string" ? file : file.path,
  );
}

async function readStyleMap(file: string) {
  const css = await fs
    .readFile(path.join(STYLES_PATH, file), "utf8")
    .catch(() => null);
  return css === null ? null : createStyleMap(css);
}

// The rules in each of the registry's own style files, without fallbacks.
// Styles without a file have no rules.
export async function getOwnStyleMaps() {
  const maps = new Map<StyleName, StyleMap>();
  for (const { name } of STYLES) {
    maps.set(name, (await readStyleMap(`style-${name}.css`)) ?? {});
  }
  return maps;
}

// The registry's own maps: a style's rules replace the default style's rules
// marker by marker. Pass `withShadcn` to also include the styles of the synced
// shadcn primitives, which the preview needs and the build doesn't.
export async function getStyleMaps({ withShadcn = false } = {}) {
  const defaultMap = await readStyleMap(`style-${DEFAULT_STYLE}.css`);
  if (defaultMap === null) {
    throw new Error(`Missing styles/style-${DEFAULT_STYLE}.css`);
  }

  const ownMaps = await getOwnStyleMaps();
  const maps = new Map<StyleName, StyleMap>();
  for (const { name } of STYLES) {
    maps.set(name, {
      ...(withShadcn
        ? await readStyleMap(`shadcn/style-${name}.css`)
        : undefined),
      ...defaultMap,
      ...ownMaps.get(name),
    });
  }
  return maps;
}

// The base's files a source imports, by their path in the base without the
// extension, like `ui/button` for `@/registry/bases/radix/ui/button`.
export function getRegistryImports(source: string, base: BaseName) {
  const pattern = new RegExp(
    `["']@/registry/bases/${base}/([\\w./-]+)["']`,
    "g",
  );
  return [...source.matchAll(pattern)].map(([, file]) =>
    file.replace(/\.tsx?$/, ""),
  );
}

export function getMarkers(source: string) {
  return new Set(source.match(/\bcn-[\w-]+/g) ?? []);
}

// Markers still in a compiled source that the CLI won't resolve on install.
export function getUncompiledMarkers(compiled: string) {
  return [...getMarkers(compiled)].filter((marker) => !CLI_MARKERS.has(marker));
}

export async function forEachBase<T>(callback: (base: BaseName) => Promise<T>) {
  return Promise.all(BASES.map(({ name }) => callback(name)));
}

export async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      for (let item = queue.shift(); item !== undefined; item = queue.shift()) {
        await worker(item);
      }
    }),
  );
}

export async function writeFileIfChanged(file: string, content: string) {
  if ((await fs.readFile(file, "utf8").catch(() => null)) === content) return;
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}
