// Reads a registry-kit checkout and trims it to the bases, styles and items a
// registry wants. Everything the site and scripts derive from
// `apps/web/src/registry/config.ts` follows from the edits made here.

import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CONFIG_FILE = "apps/web/src/registry/config.ts";
const SITE_FILE = "apps/web/src/lib/site.ts";

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
  github: string;
  // Item names across every base. Removing the examples removes all of them.
  items: string[];
};

export type KitOptions = {
  name: string;
  homepage: string;
  github: string;
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

  // The config is import-free so both the scripts and the CLI can load it.
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
  const site = await fs.readFile(path.join(root, SITE_FILE), "utf8");

  return {
    root,
    bases: [...config.BASES],
    styles: [...config.STYLES],
    defaultStyle: config.DEFAULT_STYLE,
    name: registry.name,
    homepage: registry.homepage,
    github: site.match(/GITHUB_URL = "([^"]*)"/)?.[1] ?? "",
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

// Dependencies on the registry's own items are built as URLs under the
// homepage, so it has to be the origin the registry is served from.
export function validateHomepage(homepage: string) {
  try {
    const url = new URL(homepage);
    if (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.origin === homepage.replace(/\/+$/, "")
    )
      return;
  } catch {}
  return "Use the origin the registry is served from, like https://acme.com.";
}

// The template's homepage only fits the template's name: a renamed registry
// keeping it would install its dependencies from the template.
export function validateOwnHomepage(kit: Kit, name: string, homepage: string) {
  if (name !== kit.name && homepage.replace(/\/+$/, "") === kit.homepage)
    return `Set a homepage for ${name}: keeping ${kit.homepage} would install its dependencies from ${kit.name}.`;
}

export function validateGitHub(github: string) {
  try {
    const url = new URL(github);
    if (url.protocol === "https:" && url.hostname === "github.com") return;
  } catch {}
  return "Use a GitHub URL, like https://github.com/acme/ui.";
}

export function validateOptions(kit: Kit, options: KitOptions) {
  const errors = [
    validateName(options.name),
    validateHomepage(options.homepage),
    validateOwnHomepage(kit, options.name, options.homepage),
    validateGitHub(options.github),
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
    if ((await fs.readFile(file, "utf8").catch(() => null)) === content) return;
    await fs.writeFile(file, content);
    changed.add(path.relative(kit.root, file));
  }

  async function remove(file: string) {
    if (!(await exists(file))) return;
    await fs.rm(file, { recursive: true, force: true });
    removed.add(path.relative(kit.root, file));
  }

  // Read every input and work out every new file before touching anything,
  // so a missing or malformed file stops the run with the checkout unchanged.
  const writes = new Map<string, string>();
  const removals: string[] = [];

  const configFile = path.join(kit.root, CONFIG_FILE);
  writes.set(
    configFile,
    setDefaultBase(
      removeOptions(
        removeOptions(
          await fs.readFile(configFile, "utf8"),
          "BASES",
          removeBases,
        ),
        "STYLES",
        removeStyles,
      ),
      options.bases,
    ),
  );

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
  removals.push(
    ...lock.files
      .filter((file) => !keepFile(file))
      .map((file) => path.join(registryPath, file)),
  );
  writes.set(
    lockFile,
    `${JSON.stringify({ ...lock, files: lock.files.filter(keepFile) }, null, 2)}\n`,
  );

  for (const base of removeBases)
    removals.push(path.join(registryPath, "bases", base.name));
  for (const style of removeStyles)
    removals.push(path.join(registryPath, "styles", `style-${style.name}.css`));

  // Without items, every rule is for a marker nothing uses, which the build
  // rejects. The default style's file stays, since it's required.
  if (!options.examples) {
    for (const style of options.styles) {
      const styleFile = path.join(registryPath, "styles", `style-${style}.css`);
      const css = await fs.readFile(styleFile, "utf8").catch(() => null);
      if (css === null) continue;
      // Keeps the comment above the rules, if there is one.
      const start = css.indexOf(`.style-${style} {`);
      if (start === -1) {
        throw new Error(
          `Couldn't find .style-${style} in styles/style-${style}.css.`,
        );
      }
      writes.set(styleFile, `${css.slice(0, start)}.style-${style} {\n}\n`);
    }
  }

  for (const base of options.bases) {
    const basePath = path.join(registryPath, "bases", base);
    const registryFile = path.join(basePath, "registry.json");
    const source = await fs.readFile(registryFile, "utf8");
    const registry = JSON.parse(source) as Registry;

    if (!options.examples) {
      for (const item of registry.items) {
        for (const file of item.files ?? [])
          removals.push(
            path.join(basePath, typeof file === "string" ? file : file.path),
          );
        removals.push(path.join(basePath, "examples", `${item.name}-demo.tsx`));
      }
      writes.set(
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
    writes.set(
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

  const siteFile = path.join(kit.root, SITE_FILE);
  const site = await fs.readFile(siteFile, "utf8");
  writes.set(
    siteFile,
    site
      .replace(
        /SITE_NAME = "[^"]*"/,
        () => `SITE_NAME = ${JSON.stringify(options.name)}`,
      )
      .replace(
        /GITHUB_URL = "[^"]*"/,
        () => `GITHUB_URL = ${JSON.stringify(options.github)}`,
      ),
  );

  const packageFile = path.join(kit.root, "apps/web/package.json");
  const pkg = await readJson<{ dependencies: Record<string, string> }>(
    packageFile,
  );
  // The site can import a base's library outside the base, which keeps it.
  const basePackages = removeBases.flatMap((base) => base.package ?? []);
  const imported = await getImportedPackages(
    path.join(kit.root, "apps/web/src"),
    [
      path.join(registryPath, "config.ts"),
      ...removeBases.map((base) => path.join(registryPath, "bases", base.name)),
    ],
    basePackages,
  );
  const removePackages = basePackages.filter(
    (name) => name in pkg.dependencies && !imported.has(name),
  );
  if (removePackages.length > 0) {
    for (const name of removePackages) delete pkg.dependencies[name];
    writes.set(packageFile, `${JSON.stringify(pkg, null, 2)}\n`);
  }

  // Writes go first: if one fails, config.ts may still list what's left, but
  // nothing it lists has been deleted, so the checkout still builds.
  for (const [file, content] of writes) await write(file, content);
  for (const file of removals) await remove(file);
  if (!options.examples) {
    for (const base of options.bases)
      await removeEmptyDirs(path.join(registryPath, "bases", base));
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
// whether the formatter kept them on one line or wrapped them. Throws when an
// entry isn't found, so nothing is deleted on the strength of an edit that
// didn't apply.
function removeOptions(config: string, array: string, remove: Option[]) {
  const pattern = new RegExp(
    `(export const ${array} = \\[)([\\s\\S]*?)(\\] as const;)`,
  );
  if (!pattern.test(config))
    throw new Error(`Couldn't find ${array} in ${CONFIG_FILE}.`);

  return config.replace(
    pattern,
    (_, start: string, body: string, end: string) =>
      start +
      remove.reduce((result, option) => {
        const entry = new RegExp(
          `\\n *\\{[^{}]*\\bname: "${option.name}",[^{}]*\\},`,
        );
        if (!entry.test(result)) {
          throw new Error(
            `Couldn't find the ${option.name} entry in ${array} in ${CONFIG_FILE}. Remove it by hand, then run registry:init again.`,
          );
        }
        return result.replace(entry, "");
      }, body) +
      end,
  );
}

function setDefaultBase(config: string, bases: string[]) {
  const pattern = /export const DEFAULT_BASE = "([\w-]+)";/;
  const base = config.match(pattern)?.[1];
  if (base === undefined)
    throw new Error(`Couldn't find DEFAULT_BASE in ${CONFIG_FILE}.`);
  return bases.includes(base)
    ? config
    : config.replace(pattern, `export const DEFAULT_BASE = "${bases[0]}";`);
}

async function removeEmptyDirs(dir: string) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = path.join(dir, entry.name);
    await removeEmptyDirs(child);
    if ((await fs.readdir(child)).length === 0) await fs.rmdir(child);
  }
}

async function getImportedPackages(
  dir: string,
  skip: string[],
  names: string[],
) {
  const imported = new Set<string>();
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (skip.includes(file)) continue;
    if (entry.isDirectory()) {
      if (entry.name === "__generated__") continue;
      for (const name of await getImportedPackages(file, skip, names))
        imported.add(name);
    } else if (/\.tsx?$/.test(entry.name)) {
      const source = await fs.readFile(file, "utf8");
      for (const name of names) {
        if (source.includes(`"${name}"`) || source.includes(`"${name}/`))
          imported.add(name);
      }
    }
  }
  return imported;
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
