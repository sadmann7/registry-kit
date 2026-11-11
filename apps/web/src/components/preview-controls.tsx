"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@registry-kit/ui/components/select";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  type BaseName,
  BASES,
  type Direction,
  DIRECTIONS,
  type StyleName,
  STYLES,
} from "@/registry/config";

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

interface Selection {
  base: BaseName;
  style: StyleName;
  dir: Direction;
}

export function PreviewControls({ base, style, dir }: Selection) {
  const router = useRouter();
  const [, startTransition] = React.useTransition();
  const [selection, setSelection] = React.useOptimistic({ base, style, dir });

  function select(next: Partial<Selection>) {
    const query = new URLSearchParams({ ...selection, ...next });
    startTransition(() => {
      setSelection({ ...selection, ...next });
      router.push(`?${query}`, { scroll: false });
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
      <PreviewSelect
        label="Base"
        items={BASE_ITEMS}
        value={selection.base}
        onValueChange={(value) => select({ base: value })}
      />
      <PreviewSelect
        label="Style"
        items={STYLE_ITEMS}
        value={selection.style}
        onValueChange={(value) => select({ style: value })}
      />
      <PreviewSelect
        label="Dir"
        items={DIRECTION_ITEMS}
        value={selection.dir}
        onValueChange={(value) => select({ dir: value })}
      />
    </div>
  );
}

function PreviewSelect<T extends string>({
  label,
  items,
  value,
  onValueChange,
}: {
  label: string;
  items: readonly { value: T; label: string; hint?: string }[];
  value: T;
  onValueChange: (value: T) => void;
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
        className="h-9 w-full gap-2.5 border-border bg-card pr-2.5 pl-3 text-[13px] font-medium text-foreground data-popup-open:border-muted-foreground sm:w-fit dark:bg-card dark:hover:bg-card pointer-coarse:h-11"
      >
        <span
          id={labelId}
          className="w-11 shrink-0 text-start font-mono text-[11px] font-normal tracking-wider text-muted-foreground uppercase sm:w-auto"
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
        className="w-50 min-w-50 rounded-[10px] p-1 shadow-[0_1px_2px_rgb(0_0_0/4%),0_8px_24px_rgb(0_0_0/8%)]"
      >
        <SelectGroup className="flex flex-col gap-px">
          {items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
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
