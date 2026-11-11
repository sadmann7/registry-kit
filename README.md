# registry-kit

A starter for [shadcn registries](https://ui.shadcn.com/docs/registry) that ship every base (Base UI, Radix UI and React Aria) and every style (Vega, Nova, Maia, Lyra, Mira, Luma, Sera and Rhea), with RTL, the way shadcn/ui's own registry does.

Scaffolded with [Better-T-Stack](https://better-t-stack.dev): Next.js, Turborepo, oxlint and oxfmt, pnpm.

## Getting started

Click **Use this template** on GitHub to create your own repository from this one, then clone it:

```bash
git clone https://github.com/<you>/<your-registry>
cd <your-registry>
pnpm install
pnpm registry:init
```

`registry:init` asks for your registry's name, homepage and GitHub repository, which bases and styles to keep, and whether to keep the example items. It then removes the rest: the bases' sources, the style files, and dependencies nothing uses anymore. Every prompt has a flag, so it also runs without prompts:

```bash
pnpm registry:init --name acme --homepage https://acme.com --github https://github.com/acme/ui --bases base,radix --styles nova,lyra --no-examples --yes
```

Nova is always built, since it's the fallback for styles the registry doesn't build. Run it on a clean working tree, so you can review the changes and undo them with git.

## How it works

You write each component once per base, with `cn-*` markers where its look changes between styles:

```tsx
<span className={cn("cn-timeline-dot absolute start-0 top-1", className)} />
```

Each style gives the markers their classes in CSS:

```css
.style-lyra {
  .cn-timeline-dot {
    @apply size-2 rounded-none bg-primary;
  }
}
```

`pnpm registry:build` compiles the markers for each style with shadcn's `transformStyle`, then runs `shadcn build` on the compiled copy. This writes `public/r/{base}-{style}/{name}.json`, which is the URL the CLI asks for when a project's registry is `https://acme.com/r/{style}/{name}.json`.

Everything else happens in the CLI when a project installs an item, based on its `components.json`:

- **RTL:** prefer logical classes (`start-0`, `ps-6`, `border-s`), so the preview's direction toggle shows the RTL layout. Physical classes (`left-0`, `pl-6`) still work: for `rtl: true` projects, the CLI converts them and flips translations, but the preview can't. Add `cn-rtl-flip` to icons that should mirror.
- **Icons:** use `IconPlaceholder` with a name for each library. The CLI swaps in the project's `iconLibrary`.
- **Imports:** `@/registry/bases/{base}/ui/*`, `hooks/*` and `lib/*` become the project's aliases.

Styles that don't define a marker fall back to the default style (`nova`), so a style file only needs the rules that differ.

## Installing items

The registry isn't listed in shadcn's registry directory, so a project adds it once:

```bash
pnpm dlx shadcn@latest registry add "@acme=https://acme.com/r/{style}/{name}.json"
```

It adds the URL under `registries` in the project's `components.json`, which also works by hand.

Then items install by name:

```bash
pnpm dlx shadcn@latest add @acme/stat-card
```

The CLI fills `{style}` from the project's own `style`, like `base-nova`, so each project gets the build for its base and style. The demo site shows the `components.json` entry. Use your registry's name and homepage in place of `acme`; `registry:init` sets both.

## Layout

```
apps/web/
  src/registry/
    config.ts                bases, styles, defaults, pinned shadcn/ui commit
    bases/{radix,base,aria}/
      registry.json          the registry: items, dependencies, files
      ui/ hooks/ lib/        item source, with cn-* markers
      examples/              demos for the preview (not published)
    styles/
      style-{style}.css      the registry's rules per style
      shadcn/                shadcn/ui's style files (synced)
    shadcn.json              files synced from shadcn/ui
  scripts/
    build-registry.ts        compile per style, then `shadcn build`
    test-registry.ts         `shadcn add --dry-run` for every base × style
    sync-shadcn.ts           sync shadcn/ui primitives and styles
    generate.ts              preview CSS and icons
```

## Adding an item

1. Add the source to `bases/radix`, `bases/base` and `bases/aria`, with markers for anything style-specific. React Aria components take `onPress` instead of `onClick` and have no `asChild`.
2. Add the item to every `registry.json`. List shadcn/ui primitives you import by name (`"button"`) and your own items by namespace (`"@acme/use-copy-to-clipboard"`) in `registryDependencies`. The build turns your own items into their URL in the same build, like `https://acme.com/r/radix-nova/use-copy-to-clipboard.json`, so they install whatever namespace a project gives the registry. That's why `homepage` must be the origin the registry is served from.
3. Give every new marker a rule in `styles/style-nova.css`, and override it in other styles as needed.
4. If you import a shadcn/ui primitive the registry didn't use before, run `pnpm registry:sync`.
5. Add a demo to each base as `examples/{name}-demo.tsx`. The preview finds it by name. Items without a demo, like hooks, show as cards under "Hooks and utilities".

`pnpm registry:build` fails when:

- a marker has no rule in the default style, or a style has a rule for a marker no item uses;
- an item imports another item or a shadcn/ui primitive without listing it in `registryDependencies`, or a package without listing it in `dependencies`;
- the bases don't have the same `name`, `homepage` and items.

## shadcn/ui primitives

Items install shadcn/ui's own components (like `button`) through `registryDependencies`, so they're never published here. To preview items in every style, `pnpm registry:sync` copies the primitives the registry imports into `bases/*/ui`, and shadcn/ui's style files into `styles/shadcn`, from the commit in `SHADCN_REF`. To update them, change `SHADCN_REF` and run the sync again.

## Preview

The site renders the raw source and styles it with CSS, like shadcn/ui's `/create` page. `scripts/generate.ts` writes every style's rules as `.style-{style} .cn-*` in `@layer base`, so a `className` passed to a component always wins. The style class goes on the preview and on `<body>`, which covers portaled content. `pnpm dev` regenerates the rules when the registry changes.

The direction toggle renders previews right-to-left, which shows what logical classes do. The CLI's conversion of physical classes only happens on install, so check that with `pnpm registry:test`, or by installing into an `rtl: true` project.

## Serving unknown styles

Projects on a style this registry doesn't build would get a 404. `resolveStyle` in `config.ts` picks the build they get instead: the default style of the same base, like `aria-lyra` to `aria-nova`. shadcn/ui's older styles without a base (`new-york-v4`, `new-york` and `default`) are Radix, so they go to `radix-nova`. Projects on a base the registry doesn't build still get a 404, including those older styles when Radix isn't built, since another base's components import a different library.

`next.config.ts` turns `resolveStyle` into rewrites for every shadcn/ui style (`SHADCN_BASES`, `SHADCN_STYLES` and `LEGACY_STYLES`), and `pnpm registry:test` serves the build with it, so the test covers the fallbacks too. Other style names get a 404.

## Scripts

| Command               | What it does                                            |
| --------------------- | ------------------------------------------------------- |
| `pnpm registry:init`  | Choose the registry's name, bases, styles and items.    |
| `pnpm dev`            | Start the preview on http://localhost:3002.             |
| `pnpm build`          | Build the registry, then the site.                      |
| `pnpm registry:build` | Build `public/r` for every base and style.              |
| `pnpm registry:test`  | Install every item for every base and style, in RTL.    |
| `pnpm registry:sync`  | Sync shadcn/ui primitives and styles from `SHADCN_REF`. |
| `pnpm typecheck`      | Type-check, after generating the preview files.         |
| `pnpm test`           | Test `registry:init` on a copy of the registry.         |
| `pnpm check`          | Lint, check formatting and type-check.                  |
| `pnpm lint`           | Run oxlint.                                             |
| `pnpm format`         | Run oxfmt.                                              |

Requires Node 24.2 or later. The scripts run on Node's built-in TypeScript support.
