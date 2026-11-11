// Runs `applyKit` on a copy of this checkout's registry, so the tests follow
// whatever bases, styles and items the template has.
//
//   node --test

import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";

import { applyKit, findKit, type Kit, type KitOptions } from "./kit.ts";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const REGISTRY = "apps/web/src/registry";
// Everything `applyKit` reads or writes.
const FILES = [REGISTRY, "apps/web/src/lib/site.ts", "apps/web/package.json"];

let root: string;
let kit: Kit;

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "registry-kit-"));
  for (const file of FILES) {
    await fs.cp(path.join(ROOT, file), path.join(root, file), {
      recursive: true,
      // Generated files aren't part of the checkout.
      filter: (source) => !source.includes("__generated__"),
    });
  }
  kit = await findKit(root);
});

afterEach(() => fs.rm(root, { recursive: true, force: true }));

function getOptions(options: Partial<KitOptions> = {}): KitOptions {
  return {
    name: kit.name,
    homepage: kit.homepage,
    github: kit.github,
    bases: kit.bases.map((base) => base.name),
    styles: kit.styles.map((style) => style.name),
    examples: true,
    ...options,
  };
}

function read(file: string) {
  return fs.readFile(path.join(root, file), "utf8");
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await read(file)) as T;
}

function exists(file: string) {
  return fs.access(path.join(root, file)).then(
    () => true,
    () => false,
  );
}

test("keeping everything changes nothing", async () => {
  const result = await applyKit(kit, getOptions());
  assert.deepEqual(result.changed, []);
  assert.deepEqual(result.removed, []);
});

test("removes the bases and styles that aren't kept", async () => {
  // The last base, so the default base moves when it isn't the only one.
  const keep = kit.bases.at(-1)!;
  const remove = kit.bases.slice(0, -1);
  const style = kit.styles.find((style) => style.name !== kit.defaultStyle)!;
  await applyKit(
    kit,
    getOptions({ bases: [keep.name], styles: [kit.defaultStyle] }),
  );

  // Read as text: importing config.ts again would return the cached module.
  const config = await read(`${REGISTRY}/config.ts`);
  for (const { name } of [...remove, style])
    assert.doesNotMatch(config, new RegExp(`name: "${name}"`));
  for (const name of [keep.name, kit.defaultStyle])
    assert.match(config, new RegExp(`name: "${name}"`));
  assert.match(config, new RegExp(`DEFAULT_BASE = "${keep.name}"`));

  for (const base of remove)
    assert.equal(await exists(`${REGISTRY}/bases/${base.name}`), false);
  assert.equal(
    await exists(`${REGISTRY}/styles/style-${style.name}.css`),
    false,
  );

  const lock = await readJson<{ files: string[] }>(`${REGISTRY}/shadcn.json`);
  assert.ok(lock.files.every((file) => !file.includes(style.name)));
  assert.ok(
    lock.files.every((file) =>
      remove.every((base) => !file.startsWith(`bases/${base.name}/`)),
    ),
  );

  const pkg = await readJson<{ dependencies: Record<string, string> }>(
    "apps/web/package.json",
  );
  for (const base of remove)
    if (base.package) assert.equal(pkg.dependencies[base.package], undefined);
});

test("renames the registry, its dependencies and the site", async () => {
  await applyKit(
    kit,
    getOptions({
      name: "orbit",
      homepage: "https://orbit.dev",
      github: "https://github.com/orbit/ui",
    }),
  );

  for (const base of kit.bases) {
    const file = `${REGISTRY}/bases/${base.name}/registry.json`;
    const registry = await readJson<{ name: string; homepage: string }>(file);
    assert.equal(registry.name, "orbit");
    assert.equal(registry.homepage, "https://orbit.dev");
    assert.doesNotMatch(await read(file), new RegExp(`"@${kit.name}/`));
  }

  const site = await read("apps/web/src/lib/site.ts");
  assert.match(site, /name: "orbit"/);
  assert.match(site, /github: "https:\/\/github.com\/orbit\/ui"/);
});

test("without examples, removes every item and style rule", async () => {
  await applyKit(kit, getOptions({ examples: false }));

  for (const base of kit.bases) {
    const basePath = `${REGISTRY}/bases/${base.name}`;
    const registry = await readJson<{ items: unknown[] }>(
      `${basePath}/registry.json`,
    );
    assert.deepEqual(registry.items, []);
    assert.deepEqual(await fs.readdir(path.join(root, basePath)), [
      "registry.json",
    ]);
  }

  for (const style of kit.styles) {
    const css = await read(`${REGISTRY}/styles/style-${style.name}.css`).catch(
      () => null,
    );
    if (css !== null) assert.doesNotMatch(css, /\.cn-/);
  }

  const lock = await readJson<{ files: string[] }>(`${REGISTRY}/shadcn.json`);
  assert.ok(lock.files.every((file) => !file.startsWith("bases/")));
});

test("invalid options change nothing", async () => {
  const before = await read(`${REGISTRY}/config.ts`);
  for (const options of [
    { name: "Not Valid" },
    { homepage: "acme.com" },
    { homepage: "https://acme.github.io/ui" },
    { homepage: "https://acme.com#" },
    { name: "orbit" },
    { github: "https://gitlab.com/acme/ui" },
    { bases: [] },
    { bases: ["unknown"] },
    {
      styles: kit.styles
        .map((style) => style.name)
        .filter((style) => style !== kit.defaultStyle),
    },
  ]) {
    await assert.rejects(applyKit(kit, getOptions(options)));
  }
  assert.equal(await read(`${REGISTRY}/config.ts`), before);
});
