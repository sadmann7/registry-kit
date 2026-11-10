# registry-kit

A starter for [shadcn registries](https://ui.shadcn.com/docs/registry) that ship every base (Radix UI, Base UI and React Aria) and every style (Vega, Nova, Maia, Lyra, Mira, Luma, Sera and Rhea), with RTL, the way shadcn/ui's own registry does.

Scaffolded with [Better-T-Stack](https://better-t-stack.dev): Next.js, Turborepo, oxlint and oxfmt, pnpm.

## Getting started

```bash
pnpm install
pnpm kit:init
```

`kit:init` asks for your registry's name and homepage, which bases and styles to keep, and whether to keep the example items. It then removes the rest: the bases' sources, the style files, and dependencies nothing uses anymore. Every prompt has a flag, so it also runs without prompts:

```bash
pnpm kit:init --name acme --homepage https://acme.com --bases radix,base --styles nova,lyra --no-examples --yes
```

Nova is always built, since it's the fallback for styles the registry doesn't build. Run it on a clean working tree, so you can review the changes and undo them with git.

## How it works

You write each component once per base, with `cn-*` markers where its look changes between styles:

```tsx
<span className={cn("cn-timeline-dot absolute top-1 left-0", className)} />
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

- **RTL:** write physical classes (`left-0`, `pl-6`, `border-l`). For `rtl: true` projects, the CLI converts them to logical classes and flips translations. Add `cn-rtl-flip` to icons that should mirror.
- **Icons:** use `IconPlaceholder` with a name for each library. The CLI swaps in the project's `iconLibrary`.
- **Imports:** `@/registry/bases/{base}/ui/*`, `hooks/*` and `lib/*` become the project's aliases.

Styles that don't define a marker fall back to the default style (`nova`), so a style file only needs the rules that differ.

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
2. Add the item to every `registry.json`. List shadcn/ui primitives you import by name (`"button"`) and your own items by namespace (`"@acme/use-copy-to-clipboard"`) in `registryDependencies`.
3. Give every new marker a rule in `styles/style-nova.css`, and override it in other styles as needed.
4. If you import a shadcn/ui primitive the registry didn't use before, run `pnpm registry:sync`.
5. Add a demo to each base as `examples/{name}-demo.tsx`. The preview finds it by name. Items with nothing to render, like hooks, can show a snippet from `src/registry/examples.ts` instead.

`pnpm registry:build` fails when a marker has no default rule, or when an item imports another item without listing it in `registryDependencies`.

## shadcn/ui primitives

Items install shadcn/ui's own components (like `button`) through `registryDependencies`, so they're never published here. To preview items in every style, `pnpm registry:sync` copies the primitives the registry imports into `bases/*/ui`, and shadcn/ui's style files into `styles/shadcn`, from the commit in `SHADCN_REF`. To update them, change `SHADCN_REF` and run the sync again.

## Preview

The site renders the raw source and styles it with CSS, like shadcn/ui's `/create` page. `scripts/generate.ts` writes every style's rules as `.style-{style} .cn-*` in `@layer base`, so a `className` passed to a component always wins. The style class goes on the preview and on `<body>`, which covers portaled content. `pnpm dev` regenerates the rules when the registry changes.

The preview renders left-to-right. Check RTL output with `pnpm registry:test`, or by installing into an `rtl: true` project.

## Serving unknown styles

Projects on a style this registry doesn't build, like `new-york-v4` or `default`, would get a 404. `next.config.ts` rewrites those requests to the default style, sending Base UI styles to `base-nova`, React Aria styles to `aria-nova`, and everything else to `radix-nova`.

## Scripts

| Command               | What it does                                            |
| --------------------- | ------------------------------------------------------- |
| `pnpm kit:init`       | Choose the registry's name, bases, styles and items.    |
| `pnpm dev`            | Start the preview on http://localhost:3001.             |
| `pnpm build`          | Build the registry, then the site.                      |
| `pnpm registry:build` | Build `public/r` for every base and style.              |
| `pnpm registry:test`  | Install every item for every base and style, in RTL.    |
| `pnpm registry:sync`  | Sync shadcn/ui primitives and styles from `SHADCN_REF`. |
| `pnpm typecheck`      | Type-check, after generating the preview files.         |
| `pnpm check`          | Lint, check formatting and type-check.                  |
| `pnpm lint`           | Run oxlint.                                             |
| `pnpm format`         | Run oxfmt.                                              |

Requires Node 24.2 or later. The scripts run on Node's built-in TypeScript support.
