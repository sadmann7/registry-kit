import { cn } from "cn";

import type { DesignSystem } from "@/lib/design-system";
import type { Direction } from "@/registry/config";

import { CARD_CLASS_NAME } from "@/lib/utils";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

const VISITORS = [
  { month: "Jan", desktop: 62, mobile: 38 },
  { month: "Feb", desktop: 78, mobile: 52 },
  { month: "Mar", desktop: 54, mobile: 44 },
  { month: "Apr", desktop: 86, mobile: 60 },
  { month: "May", desktop: 70, mobile: 48 },
  { month: "Jun", desktop: 94, mobile: 66 },
];

const BROWSERS = [
  { name: "Chrome", share: 38 },
  { name: "Safari", share: 24 },
  { name: "Firefox", share: 17 },
  { name: "Edge", share: 12 },
  { name: "Other", share: 9 },
];

// The translucent classes the shadcn CLI writes for `menuColor` on install.
const TRANSLUCENT_CLASSES =
  "bg-popover/70 backdrop-blur-2xl backdrop-saturate-150";

export function ThemeShowcase({
  design,
  dir,
}: {
  design: DesignSystem;
  dir: Direction;
}) {
  return (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <ShowcaseCard dir={dir} title="Visitors" description="January to June">
        <BarChart />
      </ShowcaseCard>
      <ShowcaseCard
        dir={dir}
        title="Browsers"
        description="Share of visits this month"
      >
        <DonutChart />
      </ShowcaseCard>
      <ShowcaseCard
        dir={dir}
        title="Workspace"
        description="Menus follow your menu color and accent"
        className="lg:col-span-2 xl:col-span-1"
      >
        <Menu menuColor={design.menuColor} />
        <div className="mt-auto flex gap-2">
          <button
            type="button"
            className="h-8 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground"
          >
            Save
          </button>
          <button
            type="button"
            className="h-8 rounded-md border bg-background px-3 text-[13px] font-medium"
          >
            Cancel
          </button>
        </div>
      </ShowcaseCard>
    </div>
  );
}

function ShowcaseCard({
  dir,
  title,
  description,
  className,
  children,
}: {
  dir: Direction;
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      dir={dir}
      data-preview
      className={cn(
        CARD_CLASS_NAME,
        "flex min-h-79 flex-col gap-4 p-5",
        className,
      )}
    >
      <div className="flex flex-col gap-0.75">
        <h3 className="cn-font-heading text-sm font-semibold">{title}</h3>
        <p className="text-[12.5px] text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function BarChart() {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <div
        role="img"
        aria-label="Desktop and mobile visitors by month"
        className="flex min-h-40 flex-1 items-end gap-2.5"
      >
        {VISITORS.map((entry) => (
          <div
            key={entry.month}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
          >
            <div className="flex h-full w-full items-end justify-center gap-0.75">
              <div
                className="w-full max-w-4 rounded-t-[min(var(--radius-sm),4px)] bg-chart-1"
                style={{ height: `${entry.desktop}%` }}
              />
              <div
                className="w-full max-w-4 rounded-t-[min(var(--radius-sm),4px)] bg-chart-2"
                style={{ height: `${entry.mobile}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground">
              {entry.month}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <LegendKey className="bg-chart-1">Desktop</LegendKey>
        <LegendKey className="bg-chart-2">Mobile</LegendKey>
      </div>
    </div>
  );
}

function LegendKey({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-2 rounded-[2px]", className)} />
      {children}
    </span>
  );
}

// Where each slice starts, as a percentage of the ring.
const BROWSER_STARTS = BROWSERS.map((_, index) =>
  BROWSERS.slice(0, index).reduce((sum, browser) => sum + browser.share, 0),
);

function DonutChart() {
  return (
    <div className="flex flex-1 items-center gap-5">
      <div className="relative size-37.5 shrink-0">
        <svg
          viewBox="0 0 100 100"
          role="img"
          aria-label="Visits by browser"
          className="size-full -rotate-90"
        >
          {BROWSERS.map((browser, index) => (
            <circle
              key={browser.name}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              strokeWidth="19"
              pathLength={100}
              stroke={`var(--chart-${index + 1})`}
              strokeDasharray={`${browser.share - 0.6} ${100 - browser.share + 0.6}`}
              strokeDashoffset={-BROWSER_STARTS[index]}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tracking-[-0.02em]">
            12.4k
          </span>
          <span className="text-[11.5px] text-muted-foreground">visits</span>
        </div>
      </div>
      <ul className="flex min-w-0 flex-1 flex-col gap-2.25">
        {BROWSERS.map((browser, index) => (
          <li
            key={browser.name}
            className="flex items-center gap-2 text-[12.5px]"
          >
            <span
              className="size-2 shrink-0 rounded-[2px]"
              style={{ background: `var(--chart-${index + 1})` }}
            />
            <span className="flex-1 truncate">{browser.name}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {browser.share}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const ICON_CLASS_NAME =
  "size-3.5 text-muted-foreground in-data-highlighted:text-accent-foreground";

const MENU_ITEMS = [
  {
    label: "Profile",
    shortcut: "⇧⌘P",
    icon: (
      <IconPlaceholder
        lucide="UserIcon"
        tabler="IconUser"
        hugeicons="UserIcon"
        phosphor="UserIcon"
        remixicon="RiUserLine"
        className={ICON_CLASS_NAME}
      />
    ),
  },
  {
    label: "Settings",
    shortcut: "⌘S",
    icon: (
      <IconPlaceholder
        lucide="SettingsIcon"
        tabler="IconSettings"
        hugeicons="Settings01Icon"
        phosphor="GearIcon"
        remixicon="RiSettings3Line"
        className={ICON_CLASS_NAME}
      />
    ),
  },
  {
    label: "Billing",
    shortcut: "⌘B",
    icon: (
      <IconPlaceholder
        lucide="CreditCardIcon"
        tabler="IconCreditCard"
        hugeicons="CreditCardIcon"
        phosphor="CreditCardIcon"
        remixicon="RiBankCardLine"
        className={ICON_CLASS_NAME}
      />
    ),
  },
];

// A menu drawn open, so the menu options show without opening one. The
// highlighted item uses the accent, which the menu accent option changes.
function Menu({ menuColor }: { menuColor: DesignSystem["menuColor"] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex h-8 w-fit items-center gap-2 rounded-md border bg-background px-2.5 text-[13px] font-medium">
        <IconPlaceholder
          lucide="FolderIcon"
          tabler="IconFolder"
          hugeicons="Folder01Icon"
          phosphor="FolderIcon"
          remixicon="RiFolderLine"
          className="size-3.5"
        />
        Acme Inc.
        <IconPlaceholder
          lucide="ChevronDownIcon"
          tabler="IconChevronDown"
          hugeicons="ArrowDown01Icon"
          phosphor="CaretDownIcon"
          remixicon="RiArrowDownSLine"
          className="size-3.5 text-muted-foreground"
        />
      </div>
      <div
        className={cn(
          "flex w-55 flex-col gap-px rounded-lg border bg-popover p-1 text-popover-foreground shadow-[0_6px_18px_rgb(0_0_0/12%)]",
          menuColor.startsWith("inverted") && "dark",
          menuColor.endsWith("-translucent") && TRANSLUCENT_CLASSES,
        )}
      >
        {MENU_ITEMS.map((item) => (
          <div
            key={item.label}
            data-highlighted={item.label === "Settings" || undefined}
            className="flex h-7.5 items-center gap-2 rounded-sm px-2 text-[13px] data-highlighted:bg-accent data-highlighted:text-accent-foreground"
          >
            {item.icon}
            {item.label}
            <span className="ms-auto text-[11.5px] text-muted-foreground">
              {item.shortcut}
            </span>
          </div>
        ))}
        <div className="-mx-1 my-1 h-px bg-border" />
        <div className="flex h-7.5 items-center gap-2 rounded-sm px-2 text-[13px] text-destructive">
          <IconPlaceholder
            lucide="LogOutIcon"
            tabler="IconLogout"
            hugeicons="Logout01Icon"
            phosphor="SignOutIcon"
            remixicon="RiLogoutBoxLine"
            className="size-3.5"
          />
          Log out
        </div>
      </div>
    </div>
  );
}
