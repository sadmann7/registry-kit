# Adding items

Every item has a copy in each base, a rule for each of its markers in Nova, and a demo for the preview. The build checks the rest.

## 1. Write the source

Add the item to each base, under `apps/web/src/registry/bases/{base,radix,aria}`, in `ui/`, `components/`, `hooks/` or `lib/`. Blocks that compose shadcn/ui primitives, like `login-form`, go in `components/`.

Give each element a `cn-*` marker where its look changes between styles, and keep the classes that don't change inline:

```tsx
<span className={cn("cn-timeline-dot absolute start-0 top-1", className)} />
```

Write markers as plain strings in `className`, a `cn()` argument, or a `cva()` base or variant. The build can't compile one inside a condition, a variable or `compoundVariants`.

- Use logical classes, like `start-0` and `ps-6`, so the item works in RTL. Add `cn-rtl-flip` to anything that should mirror, like an arrow icon.
- Use `IconPlaceholder` with a name for every icon library, not an icon import.
- Add `cn-font-heading` to titles, so they take the project's heading font, and `cn-menu-target cn-menu-translucent` to menu popups, so they follow its menu color.
- Import other files with `@/registry/bases/{base}/...`, like `@/registry/bases/radix/ui/button`.
- React Aria components take `onPress` instead of `onClick` and have no `asChild`.

## 2. List it in registry.json

Add the item to each base's `registry.json`, with the same name in all of them. Its dependencies can differ between bases, like Radix's `number-field`, which uses a hook Base UI's doesn't need:

```json
{
  "name": "number-field",
  "type": "registry:ui",
  "title": "Number Field",
  "description": "A numeric input with step buttons.",
  "dependencies": ["cn"],
  "registryDependencies": ["@registry-kit/use-controllable-state"],
  "files": [{ "path": "ui/number-field.tsx", "type": "registry:ui" }]
}
```

- `dependencies`: the npm packages the item imports. `react`, `react-dom` and `next` don't need listing.
- `registryDependencies`: shadcn/ui primitives by name, like `"button"`, and your own items by namespace, like `"@registry-kit/use-controllable-state"`.

## 3. Style it

Give every new marker a rule in `styles/style-nova.css`:

```css
.style-nova {
  .cn-timeline-dot {
    @apply size-2.5 rounded-full border-2 border-primary bg-background;
  }
}
```

Then override it in other styles where it should look different:

```css
.style-lyra {
  .cn-timeline-dot {
    @apply size-2 rounded-none bg-primary;
  }
}
```

A style without a rule for a marker uses Nova's, so a style file only needs the rules that differ.

## 4. Sync shadcn/ui primitives

If the item imports a shadcn/ui primitive the registry didn't use before, like `ui/dialog`, run:

```bash
pnpm registry:sync
```

That copies it from shadcn/ui for the preview. It's never published: projects install it from shadcn/ui through `registryDependencies`.

## 5. Add a demo

Add `examples/{name}-demo.tsx` to each base. The preview shows it in every style and direction. Items without a demo, like hooks, show as cards.

## 6. Build and test

```bash
pnpm registry:build
pnpm registry:test
```

`registry:build` fails when:

- a marker has no rule in Nova, or a style has a rule for a marker no item uses
- a marker is written where it can't be compiled, like inside a condition or a variable
- an item imports a package, primitive or item without listing it in its dependencies
- an item imports a file no item publishes and shadcn/ui doesn't provide
- the bases differ in `name`, `homepage` or items
- `homepage` isn't an origin, like `https://acme.com`

`registry:test` installs every item into an RTL project for every base and style, for every icon library, and with each `components.json` option the CLI changes source for, like `tsx: false`, `menuColor` and custom aliases, with `shadcn add --dry-run`. It catches what only shows up on install, like an icon left without a name for the project's library. It needs network access, since items pull shadcn/ui's primitives from ui.shadcn.com.
