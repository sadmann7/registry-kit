"use client";

import type { IconLibraryName } from "shadcn/icons";

import { Drawer } from "@base-ui/react/drawer";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Switch } from "@base-ui/react/switch";
import {
  Home01Icon,
  Search01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GearIcon,
  MagnifyingGlassIcon,
  HouseIcon as PhosphorHouseIcon,
} from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@registry-kit/ui/components/select";
import { RiHomeLine, RiSearchLine, RiSettings3Line } from "@remixicon/react";
import { IconHome, IconSearch, IconSettings } from "@tabler/icons-react";
import {
  CheckIcon,
  ChevronUpIcon,
  CopyIcon,
  HouseIcon,
  RotateCcwIcon,
  SearchIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react";
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
  parseDesignSystem,
  RADII,
} from "@/lib/design-system";
import {
  type BaseName,
  BASES,
  type Direction,
  STYLES,
} from "@/registry/config";
import { THEMES } from "@/registry/styles/shadcn/themes";

interface PreviewState {
  base: BaseName;
  dir: Direction;
  design: DesignSystem;
}

interface Option {
  value: string;
  label: string;
  lead?: React.ReactNode;
  disabled?: boolean;
}

type IconProps = { className?: string };

// Short enough to share a row.
const BASE_LABELS: Record<string, string> = {
  base: "Base UI",
  radix: "Radix",
  aria: "Aria",
};

// Samples in each library's own icons, so the picker shows what changes.
const ICON_SAMPLES: Record<IconLibraryName, React.ComponentType<IconProps>[]> =
  {
    lucide: [HouseIcon, SearchIcon, SettingsIcon],
    tabler: [IconHome, IconSearch, IconSettings],
    hugeicons: [Home01Icon, Search01Icon, Settings01Icon].map(
      (icon) =>
        function Hugeicon(props: IconProps) {
          return <HugeiconsIcon icon={icon} strokeWidth={2} {...props} />;
        },
    ),
    phosphor: [PhosphorHouseIcon, MagnifyingGlassIcon, GearIcon],
    remixicon: [RiHomeLine, RiSearchLine, RiSettings3Line],
  };

function getThemeVar(name: string, key: string) {
  return THEMES.find((theme) => theme.name === name)?.cssVars?.light?.[key];
}

function getThemeOptions(baseColor: string): Option[] {
  return getThemes(baseColor).map((theme) => ({
    value: theme.name,
    label: theme.title ?? theme.name,
    lead: (
      <span
        className="size-3.5 shrink-0 rounded-full ring-1 ring-foreground/15 ring-inset"
        style={{ background: getThemeVar(theme.name, "primary") }}
      />
    ),
  }));
}

function getChartOptions(baseColor: string): Option[] {
  return getThemes(baseColor).map((theme) => ({
    value: theme.name,
    label: theme.title ?? theme.name,
    lead: (
      <span className="flex h-3.5 shrink-0 items-end gap-0.5">
        {[1, 2, 3, 4, 5].map((index) => (
          <span
            key={index}
            className="w-0.75 rounded-[1px]"
            style={{
              height: 4 + index * 2,
              background: getThemeVar(theme.name, `chart-${index}`),
            }}
          />
        ))}
      </span>
    ),
  }));
}

function Corner({ radius }: { radius: number }) {
  return (
    <span
      className="size-3.5 shrink-0 border-t-[1.5px] border-l-[1.5px] border-foreground"
      style={{ borderTopLeftRadius: radius }}
    />
  );
}

const RADIUS_CORNERS = { default: 6, none: 0, small: 4, medium: 6, large: 9 };

function getRadiusOptions(style: string): Option[] {
  return RADII.map((radius) => ({
    value: radius.name,
    label: radius.title,
    lead: <Corner radius={RADIUS_CORNERS[radius.name]} />,
    disabled: style === "rhea" && radius.name === "large",
  }));
}

function FontGlyph({ font }: { font: string }) {
  return (
    <span
      className="w-4.5 shrink-0 font-semibold text-muted-foreground"
      style={{ fontFamily: `var(--font-${font})` }}
    >
      Aa
    </span>
  );
}

const FONT_OPTIONS: Option[] = FONTS.map((font) => ({
  value: font.name,
  label: font.title,
  lead: <FontGlyph font={font.name} />,
}));

function IconSamples({ library }: { library: IconLibraryName }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      {ICON_SAMPLES[library].map((Icon, index) => (
        <Icon key={index} className="size-3.5" />
      ))}
    </span>
  );
}

function usePreviewState(initial: PreviewState) {
  const router = useRouter();
  const [, startTransition] = React.useTransition();
  const [state, setState] = React.useOptimistic(initial);

  function select(next: PreviewState) {
    const query = new URLSearchParams({
      base: next.base,
      style: next.design.style,
      dir: next.dir,
      ...getDesignSystemParams(next.design),
    });
    startTransition(() => {
      setState(next);
      router.push(`?${query}`, { scroll: false });
    });
  }

  // Runs the change through the parser, so it fixes combinations the create
  // page doesn't allow, like a theme from another base color.
  function selectDesign(changes: Partial<Record<keyof DesignSystem, string>>) {
    select({
      ...state,
      design: parseDesignSystem({
        ...getDesignSystemParams(state.design),
        style: state.design.style,
        ...changes,
      }),
    });
  }

  function reset() {
    select({ ...state, design: DEFAULT_DESIGN_SYSTEM });
  }

  const changes = Object.keys(getDesignSystemParams(state.design)).length;

  return { state, select, selectDesign, reset, changes };
}

type Customizer = ReturnType<typeof usePreviewState>;

export function CustomizerPanel(props: PreviewState) {
  const customizer = usePreviewState(props);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">
          Customize
        </h2>
        <ResetButton customizer={customizer} />
      </div>
      <CustomizerFields customizer={customizer} />
    </div>
  );
}

export function CustomizerSheet(props: PreviewState) {
  const customizer = usePreviewState(props);
  const { state, changes } = customizer;
  const summary = [
    BASES.find((base) => base.name === state.base)?.title,
    STYLES.find((style) => style.name === state.design.style)?.title,
    THEMES.find((theme) => theme.name === state.design.theme)?.title,
    FONTS.find((font) => font.name === state.design.font)?.title,
  ].join(" · ");

  return (
    <Drawer.Root>
      <Drawer.Trigger className="flex h-11 w-full items-center gap-2.5 rounded-[10px] border border-border bg-card ps-3.5 pe-3 text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <SlidersHorizontalIcon className="size-4 shrink-0" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[13.5px] font-medium">Customize</span>
          <span className="truncate text-xs text-muted-foreground">
            {summary}
          </span>
        </span>
        {changes > 0 && (
          <span className="rounded-full bg-secondary px-1.75 font-mono text-[11px] text-muted-foreground">
            {changes}
          </span>
        )}
        <ChevronUpIcon className="size-3.75 shrink-0 text-muted-foreground" />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className="site-chrome fixed inset-0 min-h-dvh bg-black opacity-[calc(0.3*(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 dark:opacity-[calc(0.5*(1-var(--drawer-swipe-progress)))]" />
        <Drawer.Viewport className="site-chrome fixed inset-0 flex items-end justify-center">
          <Drawer.Popup className="flex max-h-[calc(100dvh-6rem)] w-full [transform:translateY(var(--drawer-swipe-movement-y))] flex-col rounded-t-2xl bg-background text-foreground shadow-[0_-8px_32px_rgb(0_0_0/15%)] transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] outline-none data-ending-style:[transform:translateY(100%)] data-starting-style:[transform:translateY(100%)] data-swiping:select-none dark:border-t dark:border-border">
            <div className="flex flex-col items-center gap-1.5 pt-2">
              <div className="h-1 w-9 rounded-full bg-border" />
              <div className="flex w-full items-center gap-2 border-b border-border ps-5 pe-3 pt-1.5 pb-3">
                <Drawer.Title className="flex-1 text-base font-semibold tracking-[-0.01em]">
                  Customize
                </Drawer.Title>
                <ResetButton customizer={customizer} />
                <Drawer.Close
                  aria-label="Close"
                  className="flex size-9 items-center justify-center rounded-lg outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <XIcon className="size-4.5" />
                </Drawer.Close>
              </div>
            </div>
            <Drawer.Content className="min-h-0 flex-1 scroll-fade overflow-y-auto overscroll-contain px-5 pt-5 pb-6">
              <CustomizerFields customizer={customizer} />
            </Drawer.Content>
            <div className="border-t border-border px-5 pt-3 pb-[calc(1.75rem+env(safe-area-inset-bottom,0px))]">
              <Drawer.Close className="flex h-11 w-full items-center justify-center rounded-[10px] bg-primary text-sm font-medium text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                Done
              </Drawer.Close>
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function ResetButton({ customizer }: { customizer: Customizer }) {
  return (
    <button
      type="button"
      disabled={customizer.changes === 0}
      onClick={customizer.reset}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 pointer-coarse:px-2.5 pointer-coarse:py-1.5"
    >
      <RotateCcwIcon className="size-3.25" />
      Reset
    </button>
  );
}

function CustomizerFields({ customizer }: { customizer: Customizer }) {
  const { state, select, selectDesign } = customizer;
  const { design } = state;
  const translucent = design.menuColor.endsWith("-translucent");
  const inverted = design.menuColor.startsWith("inverted");
  // Lyra and Sera are always square, so the create page locks their radius.
  const squareStyle = ["lyra", "sera"].includes(design.style);

  function setMenuColor(nextInverted: boolean, nextTranslucent: boolean) {
    selectDesign({
      menuColor: `${nextInverted ? "inverted" : "default"}${nextTranslucent ? "-translucent" : ""}`,
    });
  }

  return (
    <div className="flex flex-col gap-7">
      <Group title="Registry">
        <Field label="Base">
          <Segmented
            label="Base"
            value={state.base}
            options={BASES.map((base) => ({
              value: base.name,
              label: BASE_LABELS[base.name] ?? base.title,
            }))}
            onValueChange={(base) =>
              select({ ...state, base: base as BaseName })
            }
          />
        </Field>
        <Field label="Style">
          <Picker
            label="Style"
            value={design.style}
            options={STYLES.map((style) => ({
              value: style.name,
              label: style.title,
            }))}
            onValueChange={(style) => selectDesign({ style })}
          />
        </Field>
        <Field label="Direction">
          <Segmented
            label="Direction"
            value={state.dir}
            options={[
              { value: "ltr", label: "LTR" },
              { value: "rtl", label: "RTL" },
            ]}
            onValueChange={(dir) => select({ ...state, dir: dir as Direction })}
          />
        </Field>
      </Group>

      <Group title="Theme">
        <Field
          label="Base color"
          hint={
            BASE_COLORS.find((color) => color.name === design.baseColor)?.title
          }
        >
          <Swatches
            value={design.baseColor}
            onValueChange={(baseColor) => selectDesign({ baseColor })}
          />
        </Field>
        <Field label="Theme">
          <Picker
            label="Theme"
            value={design.theme}
            options={getThemeOptions(design.baseColor)}
            onValueChange={(theme) => selectDesign({ theme })}
          />
        </Field>
        <Field label="Chart color">
          <Picker
            label="Chart color"
            value={design.chartColor}
            options={getChartOptions(design.baseColor)}
            onValueChange={(chartColor) => selectDesign({ chartColor })}
          />
        </Field>
        <Field
          label="Radius"
          hint={
            <span className="font-mono text-xs">
              {RADII.find((radius) => radius.name === design.radius)?.value ||
                getThemeVar(design.baseColor, "radius")}
            </span>
          }
        >
          <Picker
            label="Radius"
            value={design.radius}
            options={getRadiusOptions(design.style)}
            disabled={squareStyle}
            footer="Default uses the theme's radius. Lyra and Sera are always square."
            onValueChange={(radius) => selectDesign({ radius })}
          />
        </Field>
      </Group>

      <Group title="Typography">
        <Field label="Font">
          <Picker
            label="Font"
            value={design.font}
            options={FONT_OPTIONS}
            onValueChange={(font) => selectDesign({ font })}
          />
        </Field>
        <Field label="Heading">
          <Picker
            label="Heading"
            value={design.fontHeading}
            options={[
              {
                value: "inherit",
                label: "Same as body",
                lead: <FontGlyph font={design.font} />,
              },
              ...FONT_OPTIONS,
            ]}
            onValueChange={(fontHeading) => selectDesign({ fontHeading })}
          />
        </Field>
      </Group>

      <Group title="Icons & menus">
        <Field label="Icon library">
          <Picker
            label="Icon library"
            value={design.iconLibrary}
            options={ICON_LIBRARIES.map((library) => ({
              value: library.name,
              label: library.title,
              lead: <IconSamples library={library.name} />,
            }))}
            renderItem={(option) => (
              <>
                <span className="w-14 text-muted-foreground in-data-selected:text-foreground">
                  <IconSamples library={option.value as IconLibraryName} />
                </span>
                {option.label}
              </>
            )}
            onValueChange={(iconLibrary) => selectDesign({ iconLibrary })}
          />
        </Field>
        <Field label="Menu color">
          <Segmented
            label="Menu color"
            value={inverted ? "inverted" : "default"}
            options={[
              { value: "default", label: "Default" },
              { value: "inverted", label: "Inverted" },
            ]}
            onValueChange={(value) =>
              setMenuColor(value === "inverted", translucent)
            }
          />
        </Field>
        <Field label="Menu accent">
          <Segmented
            label="Menu accent"
            value={design.menuAccent}
            options={[
              { value: "subtle", label: "Subtle" },
              // Bold doesn't work on translucent menus, so the create page
              // turns it off.
              { value: "bold", label: "Bold", disabled: translucent },
            ]}
            onValueChange={(menuAccent) => selectDesign({ menuAccent })}
          />
        </Field>
        <Toggle
          label="Translucent menus"
          checked={translucent}
          onCheckedChange={(checked) => setMenuColor(inverted, checked)}
        />
        <Toggle
          label="Pointer cursor"
          checked={design.pointer}
          onCheckedChange={(checked) =>
            selectDesign({ pointer: String(checked) })
          }
        />
      </Group>

      <Group title="Preset">
        <PresetField
          key={getPresetCode(design)}
          design={design}
          onPreset={(preset) =>
            select({
              ...state,
              design: parseDesignSystem({
                preset,
                pointer: String(design.pointer),
              }),
            })
          }
        />
        <p className="text-xs leading-[1.45] text-muted-foreground">
          Paste a code from shadcn/ui&apos;s create page to load its theme.
        </p>
      </Group>
    </div>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3.5">
      <h3 className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.75">
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="font-medium">{label}</span>
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Segmented({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onValueChange: (value: string) => void;
}) {
  return (
    <RadioGroup
      aria-label={label}
      value={value}
      onValueChange={(next) => onValueChange(next)}
      className="flex gap-0.5 rounded-lg border border-border bg-card p-0.75"
    >
      {options.map((option) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className="flex h-7 flex-1 cursor-default items-center justify-center rounded-md border border-transparent text-[12.5px] text-muted-foreground outline-none select-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:h-8.5 data-checked:border-input data-checked:bg-muted data-checked:font-medium data-checked:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
        >
          {option.label}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}

function Swatches({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <RadioGroup
      aria-label="Base color"
      value={value}
      onValueChange={(next) => onValueChange(next)}
      className="flex justify-between"
    >
      {BASE_COLORS.map((color) => (
        <Radio.Root
          key={color.name}
          value={color.name}
          aria-label={color.title}
          title={color.title}
          className="flex size-7.5 cursor-default items-center justify-center rounded-full outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:ring-[1.5px] data-checked:ring-foreground"
        >
          <span
            className="size-5.5 rounded-full"
            style={{ background: getThemeVar(color.name, "muted-foreground") }}
          />
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}

function Toggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = React.useId();

  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-[12.5px] font-medium">
        {label}
      </label>
      <Switch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="flex h-4.5 w-8 shrink-0 cursor-default rounded-full p-0.5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80"
      >
        <Switch.Thumb className="size-3.5 rounded-full bg-background shadow-sm transition-transform dark:bg-foreground data-checked:translate-x-3.5 rtl:data-checked:-translate-x-3.5 dark:data-checked:bg-primary-foreground" />
      </Switch.Root>
    </div>
  );
}

function Picker({
  label,
  value,
  options,
  disabled,
  renderItem,
  footer,
  onValueChange,
}: {
  label: string;
  value: string;
  options: Option[];
  disabled?: boolean;
  renderItem?: (option: Option) => React.ReactNode;
  footer?: string;
  onValueChange: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <Select
      items={options}
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        if (next) onValueChange(next);
      }}
    >
      <SelectTrigger
        aria-label={label}
        className="h-8.5 w-full gap-2 rounded-lg border-border bg-card ps-2.5 pe-2.5 text-[13px] font-medium text-foreground data-popup-open:border-muted-foreground dark:bg-card dark:hover:bg-card pointer-coarse:h-10"
      >
        <SelectValue className="items-center gap-2">
          {() => (
            <>
              {selected?.lead}
              <span className="truncate">{selected?.label}</span>
            </>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        alignItemWithTrigger={false}
        align="start"
        sideOffset={6}
        className="site-chrome min-w-(--anchor-width) rounded-[10px] p-1 shadow-[0_1px_2px_rgb(0_0_0/4%),0_8px_24px_rgb(0_0_0/8%)]"
      >
        <SelectGroup className="flex flex-col gap-px p-0">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="h-8.5 gap-2 ps-2 pe-8 text-[13px] focus:bg-secondary pointer-coarse:h-10 data-selected:font-medium [&_svg:not([class*='size-'])]:size-3.5"
            >
              {renderItem ? (
                renderItem(option)
              ) : (
                <>
                  {option.lead}
                  {option.label}
                </>
              )}
            </SelectItem>
          ))}
        </SelectGroup>
        {footer && (
          <p className="-mx-1 mt-1 border-t border-border px-3 pt-2 pb-1.5 text-[11.5px] leading-[1.45] text-muted-foreground">
            {footer}
          </p>
        )}
      </SelectContent>
    </Select>
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
  const code = getPresetCode(design);
  const [value, setValue] = React.useState(code);
  const [invalid, setInvalid] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

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
      className="flex h-8.5 items-center gap-2 rounded-lg border border-border bg-card ps-2.5 pe-1 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive pointer-coarse:h-10"
    >
      <input
        aria-label="Preset code"
        value={value}
        aria-invalid={invalid || undefined}
        spellCheck={false}
        autoComplete="off"
        onChange={(event) => {
          setValue(event.target.value);
          setInvalid(false);
        }}
        onBlur={submit}
        className="h-full min-w-0 flex-1 bg-transparent font-mono text-[12.5px] outline-none"
      />
      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy preset code"}
        onClick={() => {
          navigator.clipboard
            .writeText(code)
            .then(() => setCopied(true))
            .catch(() => {});
        }}
        className="flex size-6.5 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {copied ? (
          <CheckIcon className="size-3.25" />
        ) : (
          <CopyIcon className="size-3.25" />
        )}
      </button>
    </form>
  );
}
