// Shared by the site and the scripts in `scripts/`, which run on Node's
// built-in TypeScript support, so keep this file free of imports.

export const BASES = [
  { name: "radix", title: "Radix UI" },
  { name: "base", title: "Base UI" },
] as const;

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

export const DEFAULT_BASE = "radix";

// The shadcn/ui commit the primitives in `bases/*/ui` and the styles in
// `styles/shadcn` are synced from. Bump it and run `pnpm registry:sync`.
export const SHADCN_REF = "8ab27715521cbd4f87ae6886cd989cbb678f6de7";

export type BaseName = (typeof BASES)[number]["name"];
export type StyleName = (typeof STYLES)[number]["name"];
