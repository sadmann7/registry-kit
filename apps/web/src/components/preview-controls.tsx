"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@registry-kit/ui/components/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@registry-kit/ui/components/toggle-group";
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

const STYLE_ITEMS = STYLES.map((option) => ({
  value: option.name,
  label: option.title,
}));

const GROUP_CLASS_NAME =
  "gap-0.5 rounded-lg border border-border bg-card p-0.75";

const ITEM_CLASS_NAME =
  "h-7 rounded-md px-2 text-[13px] font-normal select-none active:scale-[0.97] sm:px-3 pointer-coarse:h-9 text-muted-foreground hover:bg-transparent hover:text-foreground aria-pressed:bg-primary aria-pressed:font-medium aria-pressed:text-primary-foreground";

const LABEL_CLASS_NAME =
  "w-13 shrink-0 font-mono text-[11px] tracking-wider text-muted-foreground uppercase sm:w-auto";

interface Selection {
  base: BaseName;
  style: StyleName;
  dir: Direction;
}

export function PreviewControls({ base, style, dir }: Selection) {
  const router = useRouter();
  const id = React.useId();
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
    <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex items-center gap-3">
        <span id={`${id}-base`} className={LABEL_CLASS_NAME}>
          Base
        </span>
        <ToggleGroup
          aria-labelledby={`${id}-base`}
          value={[selection.base]}
          onValueChange={([value]) => {
            if (value) select({ base: value as BaseName });
          }}
          className={`${GROUP_CLASS_NAME} flex-1 sm:flex-none`}
        >
          {BASES.map((option) => (
            <ToggleGroupItem
              key={option.name}
              value={option.name}
              className={`${ITEM_CLASS_NAME} flex-1 sm:flex-none`}
            >
              {option.title}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex items-center gap-3">
        <span id={`${id}-style`} className={LABEL_CLASS_NAME}>
          Style
        </span>
        <Select
          items={STYLE_ITEMS}
          value={selection.style}
          onValueChange={(value) => {
            if (value) select({ style: value });
          }}
        >
          <SelectTrigger
            aria-labelledby={`${id}-style`}
            className="h-9 flex-1 border-border bg-card text-[13px] font-medium text-foreground sm:w-45 sm:flex-none dark:bg-card dark:hover:bg-card pointer-coarse:h-11"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {STYLE_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <span id={`${id}-dir`} className={LABEL_CLASS_NAME}>
          Dir
        </span>
        <ToggleGroup
          aria-labelledby={`${id}-dir`}
          value={[selection.dir]}
          onValueChange={([value]) => {
            if (value) select({ dir: value as Direction });
          }}
          className={`${GROUP_CLASS_NAME} flex-1 sm:flex-none`}
        >
          {DIRECTIONS.map((option) => (
            <ToggleGroupItem
              key={option}
              value={option}
              className={`${ITEM_CLASS_NAME} flex-1 sm:flex-none`}
            >
              {option.toUpperCase()}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
