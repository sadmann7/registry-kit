// Shared by the site and the scripts in `scripts/`, which run on Node's
// built-in TypeScript support, so keep this file free of imports.

// `package` is the library the base's components import. `pnpm registry:init`
// removes it from the site's dependencies along with the base, unless the
// site imports it elsewhere.
export const BASES = [
  { name: "base", title: "Base UI", package: "@base-ui/react" },
  { name: "radix", title: "Radix UI", package: "radix-ui" },
  { name: "aria", title: "React Aria", package: "react-aria-components" },
] as const;

// shadcn/ui's styles from before bases, which are Radix.
export const LEGACY_STYLES = ["new-york-v4", "new-york", "default"] as const;

// Same names as shadcn/ui's styles, so `{style}` in a project's registry URL
// (for example `radix-nova`) resolves to a build of this registry.
export const STYLES = [
  { name: "vega", title: "Vega" },
  { name: "nova", title: "Nova" },
  { name: "maia", title: "Maia" },
  { name: "lyra", title: "Lyra" },
  { name: "mira", title: "Mira" },
  { name: "luma", title: "Luma" },
  { name: "sera", title: "Sera" },
  { name: "rhea", title: "Rhea" },
] as const;

// Markers a style doesn't define fall back to this style.
export const DEFAULT_STYLE = "nova";

export const DEFAULT_BASE = "base";

// Previews render in either direction. The CLI flips classes for RTL projects
// on install; the preview shows what the logical classes do.
export const DIRECTIONS = ["ltr", "rtl"] as const;

// The shadcn/ui commit the primitives in `bases/*/ui` and the styles in
// `styles/shadcn` are synced from. Bump it and run `pnpm registry:sync`.
export const SHADCN_REF = "8ab27715521cbd4f87ae6886cd989cbb678f6de7";

// The build a project on `style` (like `radix-lyra` in components.json)
// installs from, or null when there's none. An unbuilt style, including ones
// shadcn/ui adds later, falls back to its base's default style. An unbuilt
// base has none, since another base's components import a different library.
export function resolveStyle(style: string) {
  const bases: readonly string[] = BASES.map((base) => base.name);
  const styles: readonly string[] = STYLES.map((style) => style.name);
  const legacy: readonly string[] = LEGACY_STYLES;
  const [base, ...rest] = style.split("-");
  const name = rest.join("-");

  if (legacy.includes(style)) {
    return bases.includes("radix") ? `radix-${DEFAULT_STYLE}` : null;
  }
  if (!base || !bases.includes(base) || !name) return null;
  return styles.includes(name) ? style : `${base}-${DEFAULT_STYLE}`;
}

export type BaseName = (typeof BASES)[number]["name"];
export type StyleName = (typeof STYLES)[number]["name"];
export type Direction = (typeof DIRECTIONS)[number];
