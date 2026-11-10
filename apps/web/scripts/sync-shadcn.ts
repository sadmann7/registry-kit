// Copies the shadcn/ui primitives the registry imports (for example
// `@/registry/bases/radix/ui/button`) and shadcn's style files from the commit
// in `SHADCN_REF`, so the preview renders them in every style. They're never
// published: items install them through `registryDependencies`.
//
//   node scripts/sync-shadcn.ts

import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

import { SHADCN_REF, STYLES, type BaseName } from "../src/registry/config.ts";
import {
  REGISTRY_PATH,
  ROOT,
  STYLES_PATH,
  forEachBase,
  getBasePath,
  getItemFiles,
  readRegistry,
  writeFileIfChanged,
} from "./registry.ts";

const SOURCE_URL = `https://raw.githubusercontent.com/shadcn-ui/ui/${SHADCN_REF}/apps/v4`;
const LOCK_PATH = path.join(REGISTRY_PATH, "shadcn.json");

// shadcn's sources import the placeholder from its docs app. The CLI matches
// `IconPlaceholder` by name, so pointing it at ours changes nothing on install.
const ICON_PLACEHOLDER_IMPORTS = [
  ["@/app/(create)/components/icon-placeholder", "@/registry/icons/icon-placeholder"],
];

async function fetchText(url: string) {
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.text();
}

function getRegistryImports(source: string, base: BaseName) {
  const pattern = new RegExp(`["']@/registry/bases/${base}/((?:ui|hooks|lib)/[\\w-]+)["']`, "g");
  return [...source.matchAll(pattern)].map(([, file]) => file!);
}

async function syncBase(base: BaseName) {
  const basePath = getBasePath(base);
  const registry = await readRegistry(base);
  const owned = new Set(
    registry.items.flatMap(getItemFiles).map((file) => file.replace(/\.tsx?$/, "")),
  );

  const queue = (
    await Promise.all(
      [...owned].map(async (file) => getRegistryImports(await readOwned(basePath, file), base)),
    )
  ).flat();
  const synced = new Map<string, string>();
  const seen = new Set(owned);

  for (let file = queue.pop(); file !== undefined; file = queue.pop()) {
    if (seen.has(file)) continue;
    seen.add(file);

    let source: string | null = null;
    let fileName = "";
    for (const extension of [".tsx", ".ts"]) {
      fileName = `${file}${extension}`;
      source = await fetchText(`${SOURCE_URL}/registry/bases/${base}/${fileName}`);
      if (source) break;
    }
    if (!source)
      throw new Error(`shadcn/ui has no registry/bases/${base}/${file} at ${SHADCN_REF}`);

    for (const [from, to] of ICON_PLACEHOLDER_IMPORTS)
      source = source.replaceAll(`"${from}"`, `"${to}"`);

    const unknown = [...source.matchAll(/from ["'](@\/[^"']+)["']/g)]
      .map(([, specifier]) => specifier!)
      .filter(
        (specifier) =>
          !specifier.startsWith(`@/registry/bases/${base}/`) &&
          specifier !== "@/registry/icons/icon-placeholder",
      );
    if (unknown.length > 0) {
      throw new Error(
        `${base}/${fileName} imports ${unknown.join(", ")}, which the template doesn't provide`,
      );
    }

    synced.set(fileName, source);
    queue.push(...getRegistryImports(source, base));
  }

  await Promise.all(
    [...synced].map(([fileName, source]) =>
      writeFileIfChanged(path.join(basePath, fileName), source),
    ),
  );
  return [...synced.keys()].map((fileName) => `bases/${base}/${fileName}`);
}

async function readOwned(basePath: string, file: string) {
  for (const extension of [".tsx", ".ts"]) {
    const source = await fs
      .readFile(path.join(basePath, `${file}${extension}`), "utf8")
      .catch(() => null);
    if (source !== null) return source;
  }
  throw new Error(`Missing ${path.join(basePath, file)}`);
}

async function syncStyles() {
  return Promise.all(
    STYLES.map(async ({ name }) => {
      const css = await fetchText(`${SOURCE_URL}/registry/styles/style-${name}.css`);
      if (!css) throw new Error(`shadcn/ui has no style-${name}.css at ${SHADCN_REF}`);
      await writeFileIfChanged(path.join(STYLES_PATH, "shadcn", `style-${name}.css`), css);
      return `styles/shadcn/style-${name}.css`;
    }),
  );
}

const previous: { files?: string[] } = JSON.parse(
  await fs.readFile(LOCK_PATH, "utf8").catch(() => "{}"),
);
const files = [...(await forEachBase(syncBase)).flat(), ...(await syncStyles())].sort();

// Remove primitives the registry no longer imports.
await Promise.all(
  (previous.files ?? [])
    .filter((file) => !files.includes(file))
    .map((file) => fs.rm(path.join(REGISTRY_PATH, file), { force: true })),
);

// Match the repo's formatting, so `pnpm check` stays clean after a sync.
await promisify(execFile)(
  path.join(ROOT, "../../node_modules/.bin/oxfmt"),
  files.map((file) => path.join(REGISTRY_PATH, file)),
);

await writeFileIfChanged(LOCK_PATH, `${JSON.stringify({ ref: SHADCN_REF, files }, null, 2)}\n`);
console.log(`Synced ${files.length} files from shadcn-ui/ui@${SHADCN_REF.slice(0, 7)}:`);
for (const file of files) console.log(`  ${file}`);
