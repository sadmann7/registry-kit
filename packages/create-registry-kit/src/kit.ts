// Reads a registry-kit checkout and trims it to the bases, styles and items a
// registry wants. Everything the site and scripts derive from
// `apps/web/src/registry/config.ts` follows from the edits made here.

import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CONFIG_FILE = "apps/web/src/registry/config.ts";

type Option = { name: string; title: string; package?: string };

type Registry = {
  name: string;
  homepage: string;
  items: {
    name: string;
    registryDependencies?: string[];
    files?: (string | { path: string })[];
  }[];
};

export type Kit = {
  root: string;
  bases: Option[];
  styles: Option[];
  defaultStyle: string;
  name: string;
  homepage: string;
  // Item names across every base. Removing the examples removes all of them.
  items: string[];
};

export type KitOptions = {
  name: string;
  homepage: string;
  bases: string[];
  styles: string[];
  examples: boolean;
};

export async function findKit(from: string): Promise<Kit> {
  let root = path.resolve(from);
  while (!(await exists(path.join(root, CONFIG_FILE)))) {
    const parent = path.dirname(root);
    if (parent === root) {
      throw new Error(
        `No registry-kit found in ${from} or its parents (looked for ${CONFIG_FILE}).`,
      );
    }
    root = parent;
  }

  // The config is import-free so the scripts can load it, and so can we.
  const config = (await import(
    pathToFileURL(path.join(root, CONFIG_FILE)).href
  )) as {
    BASES: readonly Option[];
    STYLES: readonly Option[];
    DEFAULT_STYLE: string;
  };
  const registries = await Promise.all(
    config.BASES.map((base) =>
      readJson<Registry>(
        path.join(getRegistryPath(root), "bases", base.name, "registry.json"),
      ),
    ),
  );
  const registry = registries[0]!;

  return {
    root,
    bases: [...config.BASES],
    styles: [...config.STYLES],
    defaultStyle: config.DEFAULT_STYLE,
    name: registry.name,
    homepage: registry.homepage,
    items: [
      ...new Set(
        registries.flatMap((base) => base.items.map((item) => item.name)),
      ),
    ],
  };
}

export function validateName(name: string) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name))
    return "Use lowercase letters, numbers and dashes, like acme or acme-ui.";
}

export function validateHomepage(homepage: string) {
  try {
    const url = new URL(homepage);
    if (url.protocol === "https:" || url.protocol === "http:") return;
  } catch {}
  return "Use a full URL, like https://acme.com.";
}

export function validateOptions(kit: Kit, options: KitOptions) {
  const errors = [
    validateName(options.name),
    validateHomepage(options.homepage),
    ...getUnknown(options.bases, kit.bases, "base"),
    ...getUnknown(options.styles, kit.styles, "style"),
    options.bases.length === 0 && "Pick at least one base.",
    !options.styles.includes(kit.defaultStyle) &&
      `Keep the ${kit.defaultStyle} style: it's the fallback for styles the registry doesn't build.`,
  ].filter((error): error is string => typeof error === "string");
  if (errors.length > 0) throw new Error(errors.join("\n"));
}

function getUnknown(values: string[], options: Option[], label: string) {
  const names = options.map((option) => option.name);
  return values
    .filter((value) => !names.includes(value))
    .map(
      (value) =>
        `Unknown ${label} "${value}". Choose from ${names.join(", ")}.`,
    );
}

// Applies the options and returns the files it changed or removed, relative
// to the root.
export async function applyKit(kit: Kit, options: KitOptions) {
  validateOptions(kit, options);

  const registryPath = getRegistryPath(kit.root);
  const changed = new Set<string>();
  const removed = new Set<string>();
  const removeBases = kit.bases.filter(
    (base) => !options.bases.includes(base.name),
  );
  const removeStyles = kit.styles.filter(
    (style) => !options.styles.includes(style.name),
  );

  async function write(file: string, content: string) {
    await fs.writeFile(file, content);
    changed.add(path.relative(kit.root, file));
  }

  async function remove(file: string) {
    if (!(await exists(file))) return;
    await fs.rm(file, { recursive: true, force: true });
    removed.add(path.relative(kit.root, file));
  }

  // config.ts: drop the bases and styles, and move the default base if it
  // went with them.
  const configFile = path.join(kit.root, CONFIG_FILE);
  let config = await fs.readFile(configFile, "utf8");
  config = removeOptions(config, "BASES", removeBases);
  config = removeOptions(config, "STYLES", removeStyles);
  config = config.replace(
    /export const DEFAULT_BASE = "([\w-]+)";/,
    (line, base: string) =>
      options.bases.includes(base)
        ? line
        : `export const DEFAULT_BASE = "${options.bases[0]}";`,
  );
  await write(configFile, config);

  // Synced shadcn/ui files for the removed bases and styles, and every synced
  // primitive when the example items go, since nothing imports them anymore.
  // `pnpm registry:sync` brings back the ones a new item imports.
  const lockFile = path.join(registryPath, "shadcn.json");
  const lock = await readJson<{ ref: string; files: string[] }>(lockFile);
  const keepFile = (file: string) =>
    !(
      (!options.examples && file.startsWith("bases/")) ||
      removeBases.some((base) => file.startsWith(`bases/${base.name}/`)) ||
      removeStyles.some(
        (style) => file === `styles/shadcn/style-${style.name}.css`,
      )
    );
  for (const file of lock.files.filter((file) => !keepFile(file)))
    await remove(path.join(registryPath, file));
  await write(
    lockFile,
    `${JSON.stringify({ ...lock, files: lock.files.filter(keepFile) }, null, 2)}\n`,
  );

  for (const base of removeBases)
    await remove(path.join(registryPath, "bases", base.name));
  for (const style of removeStyles)
    await remove(path.join(registryPath, "styles", `style-${style.name}.css`));

  for (const base of options.bases) {
    const basePath = path.join(registryPath, "bases", base);
    const registryFile = path.join(basePath, "registry.json");
    const source = await fs.readFile(registryFile, "utf8");
    const registry = JSON.parse(source) as Registry;

    if (!options.examples) {
      for (const item of registry.items) {
        for (const file of item.files ?? [])
          await remove(
            path.join(basePath, typeof file === "string" ? file : file.path),
          );
        await remove(path.join(basePath, "examples", `${item.name}-demo.tsx`));
      }
      await removeEmptyDirs(basePath);
      await write(
        registryFile,
        `${JSON.stringify(
          {
            ...registry,
            name: options.name,
            homepage: options.homepage,
            items: [],
          },
          null,
          2,
        )}\n`,
      );
      continue;
    }

    // Edit the text rather than rewriting the JSON, so the file keeps its
    // formatting. The registry's own name comes before any item's.
    await write(
      registryFile,
      source
        .replace(
          /"name": "(?:[^"\\]|\\.)*"/,
          () => `"name": ${JSON.stringify(options.name)}`,
        )
        .replace(
          /"homepage": "(?:[^"\\]|\\.)*"/,
          () => `"homepage": ${JSON.stringify(options.homepage)}`,
        )
        .replaceAll(`"@${kit.name}/`, () => `"@${options.name}/`),
    );
  }

  if (!options.examples) {
    const usageFile = path.join(registryPath, "examples.ts");
    const usage = await fs.readFile(usageFile, "utf8");
    await write(usageFile, usage.replace(/= \{[\s\S]*\};\n$/, "= {};\n"));
  }

  const siteFile = path.join(kit.root, "apps/web/src/lib/site.ts");
  const site = await fs.readFile(siteFile, "utf8");
  await write(
    siteFile,
    site.replace(
      /name: "[^"]*"/,
      () => `name: ${JSON.stringify(options.name)}`,
    ),
  );

  const packageFile = path.join(kit.root, "apps/web/package.json");
  const pkg = await readJson<{ dependencies: Record<string, string> }>(
    packageFile,
  );
  const removePackages = removeBases
    .map((base) => base.package)
    .filter((name) => name !== undefined && name in pkg.dependencies);
  if (removePackages.length > 0) {
    for (const name of removePackages) delete pkg.dependencies[name!];
    await write(packageFile, `${JSON.stringify(pkg, null, 2)}\n`);
  }

  return {
    changed: [...changed].sort(),
    removed: [...removed].sort(),
    dependenciesChanged: removePackages.length > 0,
  };
}

function getRegistryPath(root: string) {
  return path.join(root, "apps/web/src/registry");
}

// Removes `{ name: "...", ... },` entries from one of the arrays in config.ts,
// whether the formatter kept them on one line or wrapped them.
function removeOptions(config: string, array: string, remove: Option[]) {
  return config.replace(
    new RegExp(`(export const ${array} = \\[)([\\s\\S]*?)(\\] as const;)`),
    (_, start: string, body: string, end: string) =>
      start +
      remove.reduce(
        (result, option) =>
          result.replace(
            new RegExp(`\\n *\\{[^{}]*\\bname: "${option.name}",[^{}]*\\},`),
            "",
          ),
        body,
      ) +
      end,
  );
}

async function removeEmptyDirs(dir: string) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = path.join(dir, entry.name);
    await removeEmptyDirs(child);
    if ((await fs.readdir(child)).length === 0) await fs.rmdir(child);
  }
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf8")) as T;
}

async function exists(file: string) {
  return fs.access(file).then(
    () => true,
    () => false,
  );
}
