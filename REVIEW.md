# Review

registry-kit is a starter for shadcn registries that build every base and style. Registries made from it ship copy-paste components into other people's apps, so failure means an item that installs broken, looks wrong in one style, or misbehaves in RTL.

## Checks

- `pnpm lint`, `pnpm format:check`, `pnpm typecheck`.
- `pnpm registry:build` and `pnpm registry:test` when anything under `apps/web/src/registry` or `apps/web/scripts` changes.
- `pnpm registry:sync` when an item starts importing a shadcn/ui primitive the registry didn't use before.

## What to look for

- **Bases drift.** Items exist under `bases/radix`, `bases/base` and `bases/aria`. A fix in one base and not the others is a bug unless the difference is the primitive's API.
- **Markers.** Classes that change between styles belong in a `cn-*` marker with a rule in `style-nova.css`. Layout that never changes stays inline. Other styles override a marker's whole rule, not part of it.
- **RTL.** Source prefers logical classes (`start-*`, `ps-*`, `border-s`), so the preview's direction toggle shows the RTL layout. Physical classes still install correctly, since the CLI converts them for `rtl: true` projects, but the preview can't show that. Icons that should mirror use `cn-rtl-flip`. Hand-written `rtl:` variants can clash with the ones the CLI adds.
- **Dependencies.** Every `@/registry/bases/...` import is listed in `registryDependencies`, by name for shadcn/ui primitives and by namespace for the registry's own items. npm imports are listed in `dependencies`.
- **Synced from shadcn/ui.** Files listed in `src/registry/shadcn.json` are overwritten on the next sync. Changes to them belong upstream or in the sync script.
- **Build parity.** The preview's CSS and the published JSON come from the same style maps. A change to one path in `scripts/` without the other is a finding.
- **Fixes.** A bug fix names the cause and fixes it, not the symptom.
- **Comments.** Comments that restate the code, narrate steps, or explain the fix, and JSDoc on components, parts, or internal helpers. Lint only checks the form.

## Skip

- Formatting and lint-enforced style.
- `pnpm-lock.yaml`, `public/r`, `__generated__`, and the synced shadcn/ui files.

## Format

- Start with a count: `N important, N nit, N pre-existing`. Say plainly when nothing needs fixing.
- Every finding gives `file:line` and the input or state that breaks.
- At most three nits.
