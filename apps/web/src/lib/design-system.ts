// The options of shadcn/ui's create page, which a project's components.json
// and theme come from, and the CSS they give the preview. The page reads
// `base` and `dir` alongside them.

import { iconLibraries, type IconLibraryName } from "shadcn/icons";
import {
  decodePreset,
  DEFAULT_PRESET_CONFIG,
  encodePreset,
  isPresetCode,
  PRESET_BASE_COLORS,
  type PresetConfig,
  V1_CHART_COLOR_MAP,
} from "shadcn/preset";

import { DEFAULT_STYLE, type StyleName, STYLES } from "@/registry/config";
import { THEMES } from "@/registry/styles/shadcn/themes";

export const BASE_COLORS = THEMES.filter((theme) =>
  (PRESET_BASE_COLORS as readonly string[]).includes(theme.name),
);

export const FONTS = [
  { name: "geist", title: "Geist" },
  { name: "inter", title: "Inter" },
  { name: "noto-sans", title: "Noto Sans" },
  { name: "nunito-sans", title: "Nunito Sans" },
  { name: "figtree", title: "Figtree" },
  { name: "roboto", title: "Roboto" },
  { name: "raleway", title: "Raleway" },
  { name: "dm-sans", title: "DM Sans" },
  { name: "public-sans", title: "Public Sans" },
  { name: "outfit", title: "Outfit" },
  { name: "oxanium", title: "Oxanium" },
  { name: "manrope", title: "Manrope" },
  { name: "space-grotesk", title: "Space Grotesk" },
  { name: "montserrat", title: "Montserrat" },
  { name: "ibm-plex-sans", title: "IBM Plex Sans" },
  { name: "source-sans-3", title: "Source Sans 3" },
  { name: "instrument-sans", title: "Instrument Sans" },
  { name: "geist-mono", title: "Geist Mono" },
  { name: "jetbrains-mono", title: "JetBrains Mono" },
  { name: "noto-serif", title: "Noto Serif" },
  { name: "roboto-slab", title: "Roboto Slab" },
  { name: "merriweather", title: "Merriweather" },
  { name: "lora", title: "Lora" },
  { name: "playfair-display", title: "Playfair Display" },
  { name: "eb-garamond", title: "EB Garamond" },
  { name: "instrument-serif", title: "Instrument Serif" },
] as const;

export const ICON_LIBRARIES = Object.values(iconLibraries);

export const RADII = [
  { name: "default", title: "Default", value: "" },
  { name: "none", title: "None", value: "0" },
  { name: "small", title: "Small", value: "0.45rem" },
  { name: "medium", title: "Medium", value: "0.625rem" },
  { name: "large", title: "Large", value: "0.875rem" },
] as const;

export const MENU_COLORS = [
  { name: "default", title: "Default" },
  { name: "inverted", title: "Inverted" },
  { name: "default-translucent", title: "Translucent" },
  { name: "inverted-translucent", title: "Inverted translucent" },
] as const;

export const MENU_ACCENTS = [
  { name: "subtle", title: "Subtle" },
  { name: "bold", title: "Bold" },
] as const;

const RADIUS_SCALE = {
  sm: 0.6,
  md: 0.8,
  lg: 1,
  xl: 1.4,
  "2xl": 1.8,
  "3xl": 2.2,
  "4xl": 2.6,
};

export type MenuColor = (typeof MENU_COLORS)[number]["name"];

export interface DesignSystem {
  style: StyleName;
  baseColor: string;
  theme: string;
  chartColor: string;
  iconLibrary: IconLibraryName;
  font: string;
  fontHeading: string;
  radius: (typeof RADII)[number]["name"];
  menuAccent: (typeof MENU_ACCENTS)[number]["name"];
  menuColor: MenuColor;
  pointer: boolean;
}

export const DEFAULT_DESIGN_SYSTEM: DesignSystem = {
  ...(DEFAULT_PRESET_CONFIG as Omit<DesignSystem, "style" | "pointer">),
  style: DEFAULT_STYLE,
  chartColor: DEFAULT_PRESET_CONFIG.chartColor ?? DEFAULT_PRESET_CONFIG.theme,
  pointer: false,
};

// A base color's own theme, then the colored themes. Other base colors'
// themes don't apply.
export function getThemes(baseColor: string) {
  return THEMES.filter(
    (theme) =>
      theme.name === baseColor ||
      !BASE_COLORS.some((color) => color.name === theme.name),
  );
}

function pick<T extends string>(
  value: unknown,
  options: readonly { name: string }[],
  fallback: T,
): T {
  return options.some((option) => option.name === value)
    ? (value as T)
    : fallback;
}

type SearchParams = Record<string, string | string[] | undefined>;

// Reads the options from `?preset=` if there's one, with the other params
// taking precedence, so a link can change one option of a preset. Then fixes
// combinations the create page doesn't allow.
export function parseDesignSystem(params: SearchParams): DesignSystem {
  const preset =
    typeof params.preset === "string" && isPresetCode(params.preset)
      ? decodePreset(params.preset)
      : null;
  const read = (key: keyof DesignSystem): unknown =>
    typeof params[key] === "string"
      ? params[key]
      : (preset as Record<string, string> | null)?.[key];
  const defaults = DEFAULT_DESIGN_SYSTEM;

  const style = pick<StyleName>(read("style"), STYLES, defaults.style);
  const baseColor = pick(read("baseColor"), BASE_COLORS, defaults.baseColor);
  const themes = getThemes(baseColor);
  const theme = pick(read("theme"), themes, baseColor);
  // Version 1 presets have no chart color, and took it from the theme.
  const chartColor = pick(
    read("chartColor") ??
      (preset ? (V1_CHART_COLOR_MAP[preset.theme] ?? preset.theme) : undefined),
    themes,
    pick(defaults.chartColor, themes, baseColor),
  );
  const font = pick(read("font"), FONTS, defaults.font);
  const fontHeading = pick(read("fontHeading"), FONTS, "inherit");
  const menuColor = pick(read("menuColor"), MENU_COLORS, defaults.menuColor);
  let menuAccent = pick(read("menuAccent"), MENU_ACCENTS, defaults.menuAccent);
  let radius = pick(read("radius"), RADII, defaults.radius);

  if (menuColor.endsWith("-translucent")) menuAccent = "subtle";
  // A plain string, since `registry:init` can remove these from STYLES.
  const styleName: string = style;
  if (styleName === "lyra" || styleName === "sera") radius = "none";
  if (styleName === "rhea" && radius === "large") radius = "default";

  return {
    style,
    baseColor,
    theme,
    chartColor,
    iconLibrary: pick(
      read("iconLibrary"),
      ICON_LIBRARIES,
      defaults.iconLibrary,
    ),
    font,
    fontHeading: fontHeading === font ? "inherit" : fontHeading,
    radius,
    menuAccent,
    menuColor,
    pointer: params.pointer === "true",
  };
}

function pickRandom<T>(options: readonly T[]) {
  return options[Math.floor(Math.random() * options.length)];
}

// Draws the theme and chart color from the base color's own, which
// `generateRandomPreset` doesn't, so the parser doesn't throw them out.
export function getRandomDesignSystem(pointer: boolean): DesignSystem {
  const baseColor = pickRandom(BASE_COLORS).name;
  const themes = getThemes(baseColor);
  return parseDesignSystem({
    style: pickRandom(STYLES).name,
    baseColor,
    theme: pickRandom(themes).name,
    chartColor: pickRandom(themes).name,
    iconLibrary: pickRandom(ICON_LIBRARIES).name,
    font: pickRandom(FONTS).name,
    fontHeading: Math.random() < 0.5 ? "inherit" : pickRandom(FONTS).name,
    radius: pickRandom(RADII).name,
    menuColor: pickRandom(MENU_COLORS).name,
    menuAccent: pickRandom(MENU_ACCENTS).name,
    pointer: String(pointer),
  });
}

export function getPresetCode(design: DesignSystem) {
  return encodePreset(design as Partial<PresetConfig>);
}

export function getDesignSystemParams(design: DesignSystem) {
  return Object.fromEntries(
    Object.entries(design)
      .filter(([key, value]) => DEFAULT_DESIGN_SYSTEM[key as never] !== value)
      .map(([key, value]) => [key, String(value)]),
  );
}

// The preview's own elements and the popups portaled out of them. The site's
// header, main and popups carry `site-chrome`, so they keep the site's theme.
const PREVIEW_ROOTS =
  ":is([data-preview], body > :not(.site-chrome, :has(.site-chrome)))";

function getThemeVars(name: string) {
  const vars = THEMES.find((theme) => theme.name === name)?.cssVars;
  return {
    light: { ...vars?.light } as Record<string, string>,
    dark: { ...vars?.dark } as Record<string, string>,
  };
}

function toDeclarations(vars: Record<string, string>) {
  return Object.entries(vars)
    .map(([name, value]) => `  --${name}: ${value};`)
    .join("\n");
}

export function getDesignSystemCss(design: DesignSystem) {
  const base = getThemeVars(design.baseColor);
  const theme = getThemeVars(design.theme);
  const chart = getThemeVars(design.chartColor);
  const light = { ...base.light, ...theme.light };
  const dark = { ...base.dark, ...theme.dark };

  for (let index = 1; index <= 5; index++) {
    const key = `chart-${index}`;
    if (chart.light[key]) light[key] = chart.light[key];
    if (chart.dark[key]) dark[key] = chart.dark[key];
  }
  if (design.menuAccent === "bold") {
    for (const vars of [light, dark]) {
      vars.accent = vars.primary!;
      vars["accent-foreground"] = vars["primary-foreground"]!;
    }
  }
  const radius = RADII.find((option) => option.name === design.radius)?.value;
  if (radius) light.radius = radius;
  // Tailwind declares the scale on :root, where it resolves against the
  // site's radius, so the previews declare their own.
  for (const [size, scale] of Object.entries(RADIUS_SCALE)) {
    light[`radius-${size}`] = `calc(var(--radius) * ${scale})`;
  }

  const fontHeading =
    design.fontHeading === "inherit" ? design.font : design.fontHeading;
  const rules = [
    `${PREVIEW_ROOTS} {\n${toDeclarations({
      ...light,
      "font-sans": `var(--font-${design.font})`,
      "font-heading": `var(--font-${fontHeading})`,
    })}\n  font-family: var(--font-sans);\n  color: var(--foreground);\n}`,
    `.dark ${PREVIEW_ROOTS}, ${PREVIEW_ROOTS}.dark, ${PREVIEW_ROOTS} .dark {\n${toDeclarations(dark)}\n}`,
  ];
  if (design.pointer) {
    rules.push(
      `@layer base {\n  ${PREVIEW_ROOTS} :is(button:not(:disabled), [role="button"]:not(:disabled)) {\n    cursor: pointer;\n  }\n}`,
    );
  }
  return rules.join("\n\n");
}
