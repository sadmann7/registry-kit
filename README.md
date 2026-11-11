# registry-kit

A starter for [shadcn registries](https://ui.shadcn.com/docs/registry) that ship every base and every style, with RTL, the way shadcn/ui's own registry does.

- **Bases:** Base UI, Radix UI and React Aria
- **Styles:** Vega, Nova, Maia, Lyra, Mira, Luma, Sera and Rhea
- **RTL:** logical classes in the source, converted by the shadcn CLI on install
- **Preview site:** every item in every base, style and direction

## Quick start

Click **Use this template** on GitHub, then:

```bash
git clone https://github.com/<you>/<your-registry>
cd <your-registry>
pnpm install
pnpm registry:init
pnpm dev
```

`registry:init` asks for your registry's name, homepage and GitHub repository, which bases and styles to keep, and whether to keep the example items. It removes everything else. Run it on a clean working tree so you can review the changes with git.

Every prompt has a flag, for scripts and CI. Run `pnpm registry:init --help` for the full list.

```bash
pnpm registry:init --name acme --homepage https://acme.com \
  --github https://github.com/acme/ui --bases base,radix \
  --styles nova,lyra --no-examples --yes
```

Nova is always kept, since it's the fallback style.

## Installing items

A project adds the registry once:

```bash
pnpm dlx shadcn@latest registry add "@acme=https://acme.com/r/{style}/{name}.json"
```

Then installs items by name:

```bash
pnpm dlx shadcn@latest add @acme/stat-card
```

The CLI fills `{style}` from the project's `components.json`, like `base-nova`, so each project gets the build for its own base and style.

## How it works

Write each component once per base, with `cn-*` markers where its look changes between styles:

```tsx
<span className={cn("cn-timeline-dot absolute start-0 top-1", className)} />
```

Give the markers their classes in each style's CSS:

```css
.style-lyra {
  .cn-timeline-dot {
    @apply size-2 rounded-none bg-primary;
  }
}
```

`pnpm registry:build` compiles the markers for each style with shadcn's `transformStyle`, then runs `shadcn build`. The output goes to `public/r/{base}-{style}/{name}.json`. A style that doesn't define a marker falls back to Nova, so a style file only needs the rules that differ.

The shadcn CLI handles the rest when a project installs an item:

| What        | In your source                                         | On install                               |
| ----------- | ------------------------------------------------------ | ---------------------------------------- |
| **RTL**     | Logical classes (`start-0`, `ps-6`), `cn-rtl-flip`     | Physical classes flip for `rtl: true`    |
| **Icons**   | `IconPlaceholder` with a name for each library         | The project's `iconLibrary`              |
| **Imports** | `@/registry/bases/{base}/ui/*`, `hooks/*` and `lib/*`  | The project's aliases                    |

## Adding an item

1. Add the source to `bases/base`, `bases/radix` and `bases/aria`. React Aria components take `onPress` instead of `onClick` and have no `asChild`.
2. Add the item to each base's `registry.json`. In `registryDependencies`, list shadcn/ui primitives by name (`"button"`) and your own items by namespace (`"@acme/use-copy-to-clipboard"`).
3. Give every new marker a rule in `styles/style-nova.css`, and override it in other styles as needed.
4. If you import a shadcn/ui primitive the registry didn't use before, run `pnpm registry:sync`.
5. Add a demo to each base as `examples/{name}-demo.tsx`. Items without a demo, like hooks, show as cards.

Dependencies on your own items are published as URLs under `homepage`, so projects can install them whatever namespace they use. That's why `homepage` has to be the origin the registry is served from.

`pnpm registry:build` fails when:

- a marker has no rule in Nova, or a style has a rule for a marker no item uses
- a marker is written where it can't be compiled, like inside a condition or a variable
- an item imports a package, primitive or item without listing it in its dependencies
- an item imports a file no item publishes and shadcn/ui doesn't provide
- the bases differ in `name`, `homepage` or items
- `homepage` isn't an origin, like `https://acme.com`

## Unbuilt styles

A project on a style the registry doesn't build gets a fallback instead of a 404:

| Project style                              | Gets                           |
| ------------------------------------------ | ------------------------------ |
| A style of a built base, like `aria-lyra`  | That base's Nova (`aria-nova`) |
| `new-york-v4`, `new-york`, `default`       | `radix-nova`                   |
| A base the registry doesn't build          | 404                            |

`resolveStyle` in `config.ts` decides the fallback, `next.config.ts` turns it into rewrites, and `pnpm registry:test` checks it.

## Preview

The site renders the raw source and styles it with CSS, like shadcn/ui's `/create` page. `pnpm dev` regenerates the styles, icons and demo list when the registry changes.

The direction toggle shows what logical classes do. Physical classes are only converted on install, so check those with `pnpm registry:test`.

shadcn/ui's own primitives (like `button`) are never published here. Items install them through `registryDependencies`. For the preview, `pnpm registry:sync` copies the ones the registry imports from the commit in `SHADCN_REF`. To update them, change `SHADCN_REF` and sync again.

## Project structure

```
apps/web/
  scripts/
    build-registry.ts      compile each style, then shadcn build
    test-registry.ts       shadcn add --dry-run for every base and style
    sync-shadcn.ts         copy shadcn/ui primitives and styles
    generate.ts            preview styles, icons and demo list
  src/registry/
    config.ts              bases, styles, defaults, SHADCN_REF
    bases/{base,radix,aria}/
      registry.json        items, dependencies, files
      ui/ hooks/ lib/      item source, with cn-* markers
      examples/            demos for the preview, not published
    styles/
      style-{style}.css    the registry's rules for each style
      shadcn/              shadcn/ui's style files, synced
    icons/                 IconPlaceholder
packages/
  cli/                     registry:init
  ui/                      the preview site's own components
```

## Scripts

| Command               | What it does                                           |
| --------------------- | ------------------------------------------------------ |
| `pnpm registry:init`  | Choose the registry's name, bases, styles and items    |
| `pnpm dev`            | Start the preview on http://localhost:3002             |
| `pnpm build`          | Build the registry, then the site                      |
| `pnpm registry:build` | Build `public/r` for every base and style              |
| `pnpm registry:test`  | Install every item for every base and style, in RTL    |
| `pnpm registry:sync`  | Sync shadcn/ui primitives and styles from `SHADCN_REF` |
| `pnpm test`           | Test `registry:init` on a copy of the registry         |
| `pnpm check`          | Lint, check formatting and type-check                  |

Requires Node 24.2 or later. The scripts run on Node's built-in TypeScript support.
