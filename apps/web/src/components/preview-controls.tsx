"use client";

import { Button } from "@registry-kit/ui/components/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@registry-kit/ui/components/select";
import { cn } from "cn";
import { SlidersHorizontalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { isPresetCode } from "shadcn/preset";

import {
  BASE_COLORS,
  DEFAULT_DESIGN_SYSTEM,
  type DesignSystem,
  FONTS,
  getDesignSystemParams,
  getPresetCode,
  getThemes,
  ICON_LIBRARIES,
  MENU_ACCENTS,
  MENU_COLORS,
  parseDesignSystem,
  RADII,
} from "@/lib/design-system";
import {
  type BaseName,
  BASES,
  type Direction,
  DIRECTIONS,
  STYLES,
} from "@/registry/config";

interface Item {
  value: string;
  label: string;
  hint?: string;
  fontFamily?: string;
}

const BASE_ITEMS = BASES.map((option) => ({
  value: option.name,
  label: option.title,
}));

const STYLE_ITEMS = STYLES.map((option) => ({
  value: option.name,
  label: option.title,
}));

const DIRECTION_ITEMS = DIRECTIONS.map((option) => ({
  value: option,
  label: option.toUpperCase(),
  hint: option === "rtl" ? "Right to left" : "Left to right",
}));

const BASE_COLOR_ITEMS = BASE_COLORS.map((option) => ({
  value: option.name,
  label: option.title ?? option.name,
}));

const RADIUS_ITEMS = RADII.map((option) => ({
  value: option.name,
  label: option.title,
  hint: option.value || undefined,
}));

const FONT_ITEMS = FONTS.map((option) => ({
  value: option.name,
  label: option.title,
  fontFamily: `var(--font-${option.name})`,
}));

const FONT_HEADING_ITEMS = [
  { value: "inherit", label: "Same as body" },
  ...FONT_ITEMS,
];

const ICON_LIBRARY_ITEMS = ICON_LIBRARIES.map((option) => ({
  value: option.name,
  label: option.title,
}));

const MENU_COLOR_ITEMS = MENU_COLORS.map((option) => ({
  value: option.name,
  label: option.title,
}));

const MENU_ACCENT_ITEMS = MENU_ACCENTS.map((option) => ({
  value: option.name,
  label: option.title,
}));

const POINTER_ITEMS = [
  { value: "false", label: "Default" },
  { value: "true", label: "Pointer", hint: "On buttons" },
];

interface Selection {
  base: BaseName;
  dir: Direction;
  design: DesignSystem;
}

export function PreviewControls({ base, dir, design }: Selection) {
  const router = useRouter();
  const panelId = React.useId();
  const [, startTransition] = React.useTransition();
  const [selection, setSelection] = React.useOptimistic({ base, dir, design });
  const [open, setOpen] = React.useState(false);
  const changes = Object.keys(
    getDesignSystemParams({
      ...selection.design,
      style: DEFAULT_DESIGN_SYSTEM.style,
    }),
  ).length;

  function select(next: Selection) {
    const query = new URLSearchParams({
      base: next.base,
      style: next.design.style,
      dir: next.dir,
      ...getDesignSystemParams(next.design),
    });
    startTransition(() => {
      setSelection(next);
      router.push(`?${query}`, { scroll: false });
    });
  }

  // Runs the change through the parser, so it fixes combinations the create
  // page doesn't allow, like a theme from another base color.
  function selectDesign(key: keyof DesignSystem, value: string) {
    select({
      ...selection,
      design: parseDesignSystem({
        ...getDesignSystemParams(selection.design),
        style: selection.design.style,
        [key]: value,
      }),
    });
  }

  const themeItems = getThemes(selection.design.baseColor).map((option) => ({
    value: option.name,
    label: option.title ?? option.name,
  }));

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <PreviewSelect
          label="Base"
          items={BASE_ITEMS}
          value={selection.base}
          onValueChange={(value) => select({ ...selection, base: value })}
        />
        <PreviewSelect
          label="Style"
          items={STYLE_ITEMS}
          value={selection.design.style}
          onValueChange={(value) => selectDesign("style", value)}
        />
        <PreviewSelect
          label="Dir"
          items={DIRECTION_ITEMS}
          value={selection.dir}
          onValueChange={(value) => select({ ...selection, dir: value })}
        />
        <Button
          variant="outline"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className="h-9 gap-2 border-border bg-card px-3 text-[13px] font-medium text-foreground hover:bg-muted aria-expanded:bg-muted dark:bg-card dark:hover:bg-muted pointer-coarse:h-11"
        >
          <SlidersHorizontalIcon className="size-3.5 text-muted-foreground" />
          Customize
          {changes > 0 && (
            <span className="rounded-full bg-secondary px-1.5 font-mono text-[11px] text-muted-foreground">
              {changes}
            </span>
          )}
        </Button>
      </div>

      {open && (
        <div
          id={panelId}
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <PreviewSelect
            label="Color"
            items={BASE_COLOR_ITEMS}
            value={selection.design.baseColor}
            onValueChange={(value) => selectDesign("baseColor", value)}
            wide
          />
          <PreviewSelect
            label="Theme"
            items={themeItems}
            value={selection.design.theme}
            onValueChange={(value) => selectDesign("theme", value)}
            wide
          />
          <PreviewSelect
            label="Chart"
            items={themeItems}
            value={selection.design.chartColor}
            onValueChange={(value) => selectDesign("chartColor", value)}
            wide
          />
          <PreviewSelect
            label="Radius"
            items={RADIUS_ITEMS}
            value={selection.design.radius}
            onValueChange={(value) => selectDesign("radius", value)}
            wide
          />
          <PreviewSelect
            label="Font"
            items={FONT_ITEMS}
            value={selection.design.font}
            onValueChange={(value) => selectDesign("font", value)}
            wide
          />
          <PreviewSelect
            label="Heading"
            items={FONT_HEADING_ITEMS}
            value={selection.design.fontHeading}
            onValueChange={(value) => selectDesign("fontHeading", value)}
            wide
          />
          <PreviewSelect
            label="Icons"
            items={ICON_LIBRARY_ITEMS}
            value={selection.design.iconLibrary}
            onValueChange={(value) => selectDesign("iconLibrary", value)}
            wide
          />
          <PreviewSelect
            label="Menu"
            items={MENU_COLOR_ITEMS}
            value={selection.design.menuColor}
            onValueChange={(value) => selectDesign("menuColor", value)}
            wide
          />
          <PreviewSelect
            label="Accent"
            items={MENU_ACCENT_ITEMS}
            value={selection.design.menuAccent}
            onValueChange={(value) => selectDesign("menuAccent", value)}
            wide
          />
          <PreviewSelect
            label="Cursor"
            items={POINTER_ITEMS}
            value={String(selection.design.pointer)}
            onValueChange={(value) => selectDesign("pointer", value)}
            wide
          />
          <PresetField
            key={getPresetCode(selection.design)}
            design={selection.design}
            onPreset={(preset) =>
              select({
                ...selection,
                design: parseDesignSystem({
                  preset,
                  pointer: String(selection.design.pointer),
                }),
              })
            }
          />
        </div>
      )}
    </div>
  );
}

// Shows the preset code shadcn/ui's create page would give these options,
// and opens one pasted from there.
function PresetField({
  design,
  onPreset,
}: {
  design: DesignSystem;
  onPreset: (preset: string) => void;
}) {
  const id = React.useId();
  const code = getPresetCode(design);
  const [value, setValue] = React.useState(code);
  const [invalid, setInvalid] = React.useState(false);

  function submit() {
    // Also takes the `--preset` flag the create page's command uses.
    const preset = value
      .trim()
      .replace(/^--preset\s+/i, "")
      .trim();
    if (preset === code) return;
    if (!isPresetCode(preset)) {
      setInvalid(true);
      return;
    }
    onPreset(preset);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex h-9 items-center gap-2.5 rounded-lg border border-border bg-card pr-1 pl-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive pointer-coarse:h-11"
    >
      <label
        htmlFor={id}
        className="w-16 shrink-0 font-mono text-[11px] tracking-wider text-muted-foreground uppercase"
      >
        Preset
      </label>
      <input
        id={id}
        value={value}
        aria-invalid={invalid || undefined}
        spellCheck={false}
        autoComplete="off"
        onChange={(event) => {
          setValue(event.target.value);
          setInvalid(false);
        }}
        onBlur={submit}
        className="h-full min-w-0 flex-1 bg-transparent font-mono text-[13px] outline-none"
      />
    </form>
  );
}

function PreviewSelect<T extends string>({
  label,
  items,
  value,
  onValueChange,
  wide,
}: {
  label: string;
  items: readonly (Item & { value: T })[];
  value: T;
  onValueChange: (value: T) => void;
  // Full width with a fixed label column, for the customize grid.
  wide?: boolean;
}) {
  const labelId = React.useId();

  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next);
      }}
    >
      <SelectTrigger
        aria-labelledby={labelId}
        className={cn(
          "h-9 w-full gap-2.5 border-border bg-card pr-2.5 pl-3 text-[13px] font-medium text-foreground data-popup-open:border-muted-foreground dark:bg-card dark:hover:bg-card pointer-coarse:h-11",
          !wide && "sm:w-fit",
        )}
      >
        <span
          id={labelId}
          className={cn(
            "shrink-0 text-start font-mono text-[11px] font-normal tracking-wider text-muted-foreground uppercase",
            wide ? "w-16" : "w-11 sm:w-auto",
          )}
        >
          {label}
        </span>
        <SelectValue />
      </SelectTrigger>
      {/* A plain menu below the trigger, not one that moves to put the
          selected item over it. */}
      <SelectContent
        alignItemWithTrigger={false}
        align="start"
        sideOffset={6}
        className="site-chrome w-50 min-w-50 rounded-[10px] p-1 shadow-[0_1px_2px_rgb(0_0_0/4%),0_8px_24px_rgb(0_0_0/8%)]"
      >
        <SelectGroup className="flex flex-col gap-px">
          {items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              style={{ fontFamily: item.fontFamily }}
              className="gap-2 py-1.75 pr-8 pl-2 text-[13px] focus:bg-secondary pointer-coarse:py-2.5 data-selected:font-medium [&_svg:not([class*='size-'])]:size-3.5"
            >
              {item.label}
              {item.hint && (
                <span className="font-normal text-muted-foreground">
                  {item.hint}
                </span>
              )}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
