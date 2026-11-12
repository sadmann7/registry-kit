// Installs every item into an RTL project for every base and style with
// `shadcn add --dry-run`, against the output of `build-registry.ts`, and checks
// what the CLI would write. Also installs for styles the registry doesn't
// build, which fall back to another build like they do when deployed, and with
// each components.json option the CLI transforms source for. Needs network
// access: items pull shadcn/ui's own primitives (like `button`) from
// ui.shadcn.com.
//
//   node scripts/build-registry.ts && node scripts/test-registry.ts

import type { AddressInfo } from "node:net";

import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { promisify, stripVTControlCharacters } from "node:util";
import { iconLibraries } from "shadcn/icons";

import {
  type BaseName,
  BASES,
  DEFAULT_STYLE,
  LEGACY_STYLES,
  resolveStyle,
  STYLES,
} from "../src/registry/config.ts";
import {
  forEachBase,
  getBasePath,
  readRegistry,
  ROOT,
  runWithConcurrency,
} from "./registry.ts";

const OUTPUT_PATH = path.join(ROOT, "public/r");
// Not the registry's own name, so installs can't rely on it.
const NAMESPACE = "registry-test";
const ICON_LIBRARIES = Object.keys(iconLibraries);
const SHADCN_BIN = path.join(ROOT, "node_modules/.bin/shadcn");

const run = promisify(execFile);

const registries = await forEachBase(async (base) => ({
  base,
  registry: await readRegistry(base),
}));
// The build checks that every base has the same homepage.
const homepage = registries[0]?.registry.homepage ?? "";

// Serves `public/r` like the deployed site: a build's own files first, then
// the fallback for styles it doesn't build. URLs under the homepage point here
// instead.
const server = createServer(async (request, response) => {
  const url = decodeURIComponent(request.url!.split("?")[0]);
  const [, style = "", name = ""] = url.match(/^\/r\/([^/]+)\/(.+)$/) ?? [];
  const file = path.join(OUTPUT_PATH, path.normalize(url.replace(/^\/r/, "")));
  const content = file.startsWith(OUTPUT_PATH)
    ? await fs
        .readFile(file, "utf8")
        .catch(() => {
          const build = resolveStyle(style);
          return build && build !== style
            ? fs.readFile(path.join(OUTPUT_PATH, build, name), "utf8")
            : null;
        })
        .catch(() => null)
    : null;
  response.writeHead(content === null ? 404 : 200, {
    "content-type": "application/json",
  });
  response.end(content?.replaceAll(`"${homepage}/r/`, `"${origin}/r/`));
});
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
const registryUrl = `${origin}/r/{style}/{name}.json`;

const fixtures = await fs.mkdtemp(path.join(os.tmpdir(), "registry-test-"));

interface Fixture {
  name: string;
  style: string;
  iconLibrary?: string;
  // Fields that differ from an RTL Next.js project's components.json.
  config?: Record<string, unknown>;
  tailwind?: Record<string, unknown>;
  aliases?: Record<string, string>;
}

// A class using a theme color the CLI inlines for `cssVariables: false`. It
// only inlines these prefixes.
const THEME_COLOR_CLASS =
  /\b(?:bg|text|border|ring)-(?:(?:background|border|input|ring|destructive)|(?:card|popover|primary|secondary|muted|accent)(?:-foreground)?|foreground)\b/;

const ALIASES = {
  components: "@/components",
  ui: "@/components/ui",
  utils: "@/lib/utils",
  lib: "@/lib",
  hooks: "@/hooks",
};

const VARIANTS: Omit<Fixture, "style">[] = [
  { name: "ltr", config: { rtl: false } },
  ...["inverted", "default-translucent", "inverted-translucent"].map(
    (menuColor) => ({ name: `menuColor ${menuColor}`, config: { menuColor } }),
  ),
  // The CLI strips "use client" from only every other file it transforms, as
  // its RSC regex keeps state, so the directive itself isn't checked.
  { name: "rsc false", config: { rsc: false } },
  { name: "tsx false", config: { tsx: false } },
  { name: "prefix", tailwind: { prefix: "tw" } },
  {
    name: "cssVariables false",
    tailwind: { cssVariables: false, baseColor: "stone" },
  },
  {
    name: "aliases",
    aliases: {
      components: "@/design",
      ui: "@/design/ui",
      utils: "@/design/utils",
      lib: "@/design/lib",
      hooks: "@/design/hooks",
    },
  },
];

async function createFixture(fixture: Fixture) {
  const dir = path.join(fixtures, fixture.name.replace(/\W+/g, "-"));
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
        style: fixture.style,
        rsc: true,
        tsx: true,
        rtl: true,
        iconLibrary: fixture.iconLibrary ?? "lucide",
        ...fixture.config,
        tailwind: {
          config: "",
          css: "src/app/globals.css",
          baseColor: "neutral",
          cssVariables: true,
          ...fixture.tailwind,
        },
        aliases: fixture.aliases ?? ALIASES,
        registries: { [`@${NAMESPACE}`]: registryUrl },
      }),
    ),
  ]);
  return dir;
}

// Each file's path and contents from `shadcn add --view` output, which boxes
// every content line in a `│ │ ` prefix.
function parseView(output: string) {
  return new Map(
    [...output.matchAll(/^├ (\S+) \(\w+\).*\n│ ┌─+\n([^]*?)\n│ └─+$/gm)].map(
      ([, file, body]) => [
        file,
        body
          .split("\n")
          .map((line) => line.slice("│ │ ".length))
          .join("\n"),
      ],
    ),
  );
}

const failures: string[] = [];
let count = 0;

try {
  const built: readonly string[] = STYLES.map(({ name }) => name);
  const [defaultLibrary = "lucide", ...otherLibraries] = ICON_LIBRARIES;
  const cases: Fixture[] = [
    ...BASES.flatMap(({ name: base }) => [
      ...built.map((style) => `${base}-${style}`),
      // A style the registry doesn't build, like one shadcn/ui adds later.
      `${base}-unbuilt`,
    ]),
    ...LEGACY_STYLES.filter((style) => resolveStyle(style) !== null).slice(
      0,
      1,
    ),
  ]
    .map((style): Fixture => ({
      name: style,
      style,
      iconLibrary: defaultLibrary,
    }))
    .concat(
      // Each base has its own copy of the icons, but every style shares it.
      BASES.flatMap(({ name: base }) =>
        otherLibraries.map((iconLibrary) => ({
          name: `${base}-${DEFAULT_STYLE} (${iconLibrary})`,
          style: `${base}-${DEFAULT_STYLE}`,
          iconLibrary,
        })),
      ),
      BASES.flatMap(({ name: base }) =>
        VARIANTS.map((variant) => ({
          ...variant,
          name: `${base}-${DEFAULT_STYLE} (${variant.name})`,
          style: `${base}-${DEFAULT_STYLE}`,
        })),
      ),
    );

  // Each run spends about half its time waiting on ui.shadcn.com, so run two
  // per core. Past 8 they slow each other down.
  const concurrency = Math.min(os.availableParallelism() * 2, 8);
  await runWithConcurrency(cases, concurrency, async (fixture) => {
    const { name, style } = fixture;
    const cwd = await createFixture(fixture);
    const javascript = fixture.config?.tsx === false;
    const aliases = Object.values(fixture.aliases ?? ALIASES);
    const otherAliases = Object.values(ALIASES).filter(
      (alias) => !aliases.includes(alias),
    );
    const base = resolveStyle(style)?.split("-")[0];
    const registry = registries.find((entry) => entry.base === base)?.registry;
    if (!registry) {
      failures.push(`${name}: no build to install from`);
      return;
    }

    // shadcn/ui has no primitives for the made-up `{base}-unbuilt` style, so
    // items that depend on one, like `button`, can't install there. A style
    // shadcn/ui adds later has them.
    const fakeStyle = style.endsWith("-unbuilt");
    const items = registry.items.filter(
      (item) =>
        !fakeStyle ||
        !item.registryDependencies?.some(
          (dependency) => !/^(?:@|https?:)/.test(dependency),
        ),
    );
    if (items.length === 0) return;

    // One CLI run per fixture, since each run costs seconds. The CLI decides
    // where each file goes, from its type, path and target, so read the paths
    // and contents from its output.
    let installed: Map<string, string>;
    try {
      const { stdout } = await run(
        SHADCN_BIN,
        [
          "add",
          ...items.map((item) => `@${NAMESPACE}/${item.name}`),
          "--dry-run",
          "--cwd",
          cwd,
          "--view",
          "src/",
        ],
        { maxBuffer: 64 * 1024 * 1024 },
      );
      installed = parseView(stripVTControlCharacters(stdout));
    } catch (error) {
      const { stdout = "", stderr = "" } = error as {
        stdout?: string;
        stderr?: string;
      };
      failures.push(`${name}: shadcn add failed\n${stdout}${stderr}`);
      return;
    }

    for (const item of items) {
      const label = `${name} @${NAMESPACE}/${item.name}`;
      for (const file of item.files ?? []) {
        const source = typeof file === "string" ? file : file.path;
        // Without the extension, which the CLI changes for JavaScript.
        const { name } = path.parse(
          typeof file !== "string" && file.target ? file.target : source,
        );
        const target = [...installed.keys()].find(
          (installedFile) => path.parse(installedFile).name === name,
        );
        count++;
        if (target === undefined) {
          failures.push(`${label}: ${source} missing from the install`);
          continue;
        }

        const content = installed.get(target)!;
        const raw = await fs.readFile(
          path.join(getBasePath(base as BaseName), source),
          "utf8",
        );
        const rtl = fixture.config?.rtl !== false;
        const menuColor =
          typeof fixture.config?.menuColor === "string"
            ? fixture.config.menuColor
            : "default";
        const problems = [
          /\bcn-[a-z]/.test(content) && "unresolved cn-* marker",
          content.includes("@/registry/") && "unresolved @/registry import",
          content.includes("IconPlaceholder") && "unresolved IconPlaceholder",
          javascript && /\.tsx?$/.test(target) && "TypeScript file",
          typeof fixture.tailwind?.prefix === "string" &&
            content.includes("className") &&
            !content.includes(`${fixture.tailwind.prefix}:`) &&
            "classes without the Tailwind prefix",
          otherAliases.some((alias) => content.includes(`"${alias}/`)) &&
            "import outside the project's aliases",
          fixture.tailwind?.cssVariables === false &&
            THEME_COLOR_CLASS.test(content) &&
            "theme color not inlined",
          raw.includes("cn-rtl-flip") &&
            rtl !== content.includes("rtl:rotate-180") &&
            (rtl ? "cn-rtl-flip not flipped" : "rtl: variant without RTL"),
          raw.includes("cn-menu-target") &&
            menuColor.startsWith("inverted") &&
            !/(?<![\w:-])dark(?![\w:-])/.test(content) &&
            "inverted menu without dark",
          raw.includes("cn-menu-translucent") &&
            menuColor.endsWith("-translucent") &&
            !content.includes("backdrop-blur") &&
            "translucent menu without its classes",
        ].filter(Boolean);
        if (problems.length > 0)
          failures.push(
            `${label} → ${target}: ${problems.join(", ")}\n${content}`,
          );
      }
    }
    console.log(`  ${name}`);
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
console.log(
  count === 0
    ? "The registry has no items, so there was nothing to install."
    : `All ${count} installs passed.`,
);
