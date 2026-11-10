#!/usr/bin/env node
// Asks which bases, styles and items a registry wants, then trims the
// registry-kit checkout to match. Every prompt has a flag, so it also runs
// without prompts in scripts and CI.
//
//   pnpm kit:init [--name acme] [--homepage https://acme.com]
//     [--bases radix,base] [--styles nova,lyra] [--no-examples] [--yes]

import * as p from "@clack/prompts";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { parseArgs } from "node:util";

import {
  applyKit,
  findKit,
  type KitOptions,
  validateHomepage,
  validateName,
  validateOptions,
} from "./kit.ts";

const HELP = `Usage: pnpm kit:init [options]

Trims this registry-kit to the bases, styles and items your registry needs.
Prompts for anything not passed as a flag.

Options:
  --name <name>         Registry namespace, as in @name/item
  --homepage <url>      Where the registry is served
  --bases <list>        Comma-separated bases to keep
  --styles <list>       Comma-separated styles to keep
  --no-examples         Remove every item, to start the registry empty
  --no-install          Skip pnpm install after removing dependencies
  -y, --yes             Use the current value for anything not passed, and
                        don't ask for confirmation. Required outside a
                        terminal, like in CI
  --cwd <dir>           The registry-kit checkout (default: current directory)
  -h, --help            Show this help`;

const run = promisify(execFile);

const { values: flags } = parseArgs({
  allowNegative: true,
  options: {
    name: { type: "string" },
    homepage: { type: "string" },
    bases: { type: "string" },
    styles: { type: "string" },
    examples: { type: "boolean" },
    install: { type: "boolean", default: true },
    yes: { type: "boolean", short: "y", default: false },
    cwd: { type: "string", default: process.cwd() },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (flags.help) {
  console.log(HELP);
  process.exit(0);
}

// Without a terminal nobody can confirm, so deleting files needs `--yes`.
if (!flags.yes && !process.stdin.isTTY) {
  console.error(
    "kit:init can't prompt without a terminal. Pass --yes, with flags for anything you want to change.",
  );
  process.exit(1);
}

const interactive = !flags.yes;

function exitIfCancelled<T>(value: T): Exclude<T, symbol> {
  if (p.isCancel(value)) {
    p.cancel("Nothing changed.");
    process.exit(0);
  }
  return value as Exclude<T, symbol>;
}

// An empty list fails rather than counting as not passed, so an unset
// variable in a script can't quietly keep or remove everything.
function splitList(flag: string, value: string) {
  const list = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (list.length === 0) fail(`--${flag} needs at least one value.`);
  return list;
}

function fail(message: string): never {
  p.log.error(message);
  process.exit(1);
}

p.intro("registry-kit");

const kit = await findKit(flags.cwd).catch((error: Error) =>
  fail(error.message),
);

const name =
  flags.name ??
  (interactive
    ? exitIfCancelled(
        await p.text({
          message: "Registry name, used as the namespace in @name/item",
          initialValue: kit.name,
          validate: (value) => validateName(value ?? ""),
        }),
      )
    : kit.name);

const homepage = (
  flags.homepage ??
  (interactive
    ? exitIfCancelled(
        await p.text({
          message: "Where will the registry be served?",
          initialValue: kit.homepage,
          validate: (value) => validateHomepage(value ?? ""),
        }),
      )
    : kit.homepage)
).replace(/\/+$/, "");

const bases =
  flags.bases !== undefined
    ? splitList("bases", flags.bases)
    : interactive
      ? exitIfCancelled(
          await p.multiselect({
            message: "Which bases should the registry support?",
            options: kit.bases.map((base) => ({
              value: base.name,
              label: base.title,
            })),
            initialValues: kit.bases.map((base) => base.name),
            required: true,
          }),
        )
      : kit.bases.map((base) => base.name);

const styles =
  flags.styles !== undefined
    ? splitList("styles", flags.styles)
    : interactive
      ? await promptStyles()
      : kit.styles.map((style) => style.name);
if (!styles.includes(kit.defaultStyle)) {
  styles.unshift(kit.defaultStyle);
  p.log.info(
    `Keeping ${kit.defaultStyle}: it's the fallback for styles the registry doesn't build.`,
  );
}

async function promptStyles() {
  return exitIfCancelled(
    await p.multiselect({
      message: "Which styles should the registry build?",
      options: kit.styles.map((style) => ({
        value: style.name,
        label: style.title,
        hint:
          style.name === kit.defaultStyle
            ? "always built, the fallback for other styles"
            : undefined,
      })),
      initialValues: kit.styles.map((style) => style.name),
      required: true,
    }),
  );
}

// "No" removes every item, so list the ones actually there, including any
// added since the template was copied.
const examples =
  flags.examples ??
  (interactive && kit.items.length > 0
    ? exitIfCancelled(
        await p.confirm({
          message: `Keep the items (${kit.items.join(", ")})? No starts the registry empty.`,
          initialValue: true,
        }),
      )
    : true);

const options: KitOptions = { name, homepage, bases, styles, examples };

try {
  validateOptions(kit, options);
} catch (error) {
  fail((error as Error).message);
}

if (interactive) {
  const dirty = await run("git", ["status", "--porcelain"], { cwd: kit.root })
    .then(({ stdout }) => stdout.trim() !== "")
    .catch(() => false);
  if (dirty)
    p.log.warn(
      "You have uncommitted changes. Commit them first if you want to undo this easily.",
    );
  const proceed = exitIfCancelled(
    await p.confirm({
      message: "This edits and deletes files in this checkout. Continue?",
    }),
  );
  if (!proceed) {
    p.cancel("Nothing changed.");
    process.exit(0);
  }
}

const spinner = p.spinner();
spinner.start("Updating the registry");
const result = await applyKit(kit, options).catch((error: Error) => {
  spinner.stop("Couldn't update the registry");
  return fail(error.message);
});

// Match the repo's formatting. Skipped if oxfmt isn't installed yet.
await run(
  path.join(kit.root, "node_modules/.bin/oxfmt"),
  result.changed.filter((file) => /\.(json|ts)$/.test(file)),
  { cwd: kit.root },
).catch(() => {});
spinner.stop(
  `Changed ${result.changed.length} files, removed ${result.removed.length}`,
);

if (result.dependenciesChanged && flags.install) {
  spinner.start("Running pnpm install");
  await run("pnpm", ["install"], { cwd: kit.root }).then(
    () => spinner.stop("Installed dependencies"),
    () => spinner.stop("pnpm install failed. Run it yourself to finish."),
  );
}

p.note(
  [
    "pnpm kit:init",
    `--name ${name}`,
    `--homepage ${homepage}`,
    `--bases ${bases.join(",")}`,
    `--styles ${styles.join(",")}`,
    ...(examples ? [] : ["--no-examples"]),
    "--yes",
  ].join(" \\\n  "),
  "To set up a fresh registry-kit the same way, run",
);

p.outro("Done. Start the preview with pnpm dev.");
