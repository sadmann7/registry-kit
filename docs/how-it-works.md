# How it works

shadcn/ui ships each component in several bases and styles from one source per base. registry-kit builds your registry the same way, with the same tools.

## The build

`pnpm registry:build` runs `apps/web/scripts/build-registry.ts`:

1. Checks every base and style, and stops with a list of every [problem](./adding-items.md#6-build-and-test) it finds.
2. For each base and style, compiles the `cn-*` markers in the base's source into that style's classes with shadcn's `transformStyle`.
3. Points dependencies on your own items, like `@acme/use-controllable-state`, at their URL under `homepage` in the same build.
4. Runs `shadcn build` on the compiled copy.

The output is one folder per build:

```text
apps/web/public/r/
  registry.json           index of the default build, for shadcn search
  base-nova/
    registry.json
    stat-card.json
  base-lyra/
  radix-nova/
  ...
```

A style's rules replace Nova's marker by marker, so a style without a rule for a marker gets Nova's. Markers the shadcn CLI resolves from the project's own config, like `cn-rtl-flip` and `cn-font-heading`, stay in the published source.

## The install

A project's registry URL has a `{style}` placeholder, which the shadcn CLI fills from `components.json`, like `radix-lyra`. The project gets that build, and the CLI adapts it on install:

| What             | In your source                                                     | On install                                                   |
| ---------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ |
| **RTL**          | Logical classes (`start-0`, `ps-6`), `cn-rtl-flip`                 | Physical classes flip for `rtl: true`                        |
| **Icons**        | `IconPlaceholder` with a name for each library                     | The project's `iconLibrary`                                  |
| **Imports**      | `@/registry/bases/{base}/ui/*`, `components/*`, `hooks/*`, `lib/*` | The project's aliases                                        |
| **Menus**        | `cn-menu-target` and `cn-menu-translucent` on popups               | Inverted or translucent for the project's `menuColor`        |
| **Heading font** | `cn-font-heading` on titles                                        | `font-heading` if the project's CSS defines `--font-heading` |

The CLI also strips `"use client"` for `rsc: false`, converts to JavaScript for `tsx: false`, adds the project's Tailwind `prefix`, and inlines colors for `cssVariables: false`. `pnpm registry:test` installs with each of these options, and with each icon library.

## Unbuilt styles

A project on a style the registry doesn't build gets a fallback instead of a 404:

| Project style                             | Gets                                             |
| ----------------------------------------- | ------------------------------------------------ |
| A style of a built base, like `aria-lyra` | That base's Nova, like `aria-nova`               |
| `new-york-v4`, `new-york`, `default`      | `radix-nova`, if the registry builds Radix       |
| A base the registry doesn't build         | 404, since its components import another library |

This covers styles shadcn/ui adds later, too. `resolveStyle` in `config.ts` picks the fallback, `next.config.ts` turns it into rewrites, and `pnpm registry:test` checks it.

## The preview

The site renders the raw source, not the build, and styles the markers with CSS, like shadcn/ui's `/create` page. `scripts/generate.ts` writes what it needs into `src/registry/__generated__`:

- every style's rules as `.style-{name} .cn-*`, with Nova's filling the gaps
- the icons `IconPlaceholder` names in each icon library, so the site doesn't bundle whole libraries, and a name a library doesn't export fails the typecheck
- each base's items and demos

`pnpm dev` regenerates them when the registry changes.

The **Customize** panel, a sidebar on wide screens and a sheet on small ones, has base, style and direction, and every option of the create page: base color, theme, chart color, radius, font, heading font, icon library, menu color, menu accent and cursor. The **Theme** section above the items shows charts and a menu in the chosen options. They use the create page's URL params, and a `?preset=` code from it opens the same design system. `src/lib/design-system.ts` turns them into the CSS variables a project would get, scoped to the previews and the popups they open. The site's own header, main and menus carry `site-chrome`, so they keep the site's theme.

The direction toggle shows what logical classes do. Physical classes are only converted on install, so check those with `pnpm registry:test`.

## shadcn/ui primitives

Items depend on shadcn/ui's own primitives, like `button`, through `registryDependencies`, so projects install them from shadcn/ui. The registry never publishes them.

The preview still needs them, so `pnpm registry:sync` copies the ones the registry imports, shadcn/ui's style files and its themes, from the commit in `SHADCN_REF`. `src/registry/shadcn.json` lists what it copied. To update them, change `SHADCN_REF` in `config.ts` and sync again.

## Project structure

```text
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
      ui/ components/      item source, with cn-* markers
      hooks/ lib/
      examples/            demos for the preview, not published
    styles/
      style-{style}.css    the registry's rules for each style
      shadcn/              shadcn/ui's style files and themes, synced
    icons/                 IconPlaceholder
  src/lib/
    design-system.ts       create page options, as preview CSS
packages/
  cli/                     registry:init
  ui/                      the preview site's own components
```
