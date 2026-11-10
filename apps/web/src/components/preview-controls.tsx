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
  type StyleName,
  STYLES,
} from "@/registry/config";

const STYLE_ITEMS = STYLES.map((option) => ({
  value: option.name,
  label: option.title,
}));

const GROUP_CLASS_NAME =
  "gap-0.5 rounded-lg border border-site-hairline bg-site-surface p-0.75";

const ITEM_CLASS_NAME =
  "h-7 rounded-md px-3 text-[13px] font-normal text-site-muted hover:bg-transparent hover:text-site-ink focus-visible:ring-site-accent/40 aria-pressed:bg-site-ink aria-pressed:font-medium aria-pressed:text-site-surface";

const LABEL_CLASS_NAME =
  "w-13 shrink-0 font-mono text-[11px] tracking-wider text-site-muted uppercase sm:w-auto";

interface Selection {
  base: BaseName;
  style: StyleName;
}

export function PreviewControls({ base, style }: Selection) {
  const router = useRouter();
  const id = React.useId();
  const [, startTransition] = React.useTransition();
  const [selection, setSelection] = React.useOptimistic({ base, style });

  function select(next: Partial<Selection>) {
    const query = new URLSearchParams({ ...selection, ...next });
    startTransition(() => {
      setSelection({ ...selection, ...next });
      router.push(`?${query}`, { scroll: false });
    });
  }

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-8">
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
        <ToggleGroup
          aria-labelledby={`${id}-style`}
          value={[selection.style]}
          onValueChange={([value]) => {
            if (value) select({ style: value as StyleName });
          }}
          className={`${GROUP_CLASS_NAME} hidden lg:flex`}
        >
          {STYLES.map((option) => (
            <ToggleGroupItem
              key={option.name}
              value={option.name}
              className={ITEM_CLASS_NAME}
            >
              {option.title}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Select
          items={STYLE_ITEMS}
          value={selection.style}
          onValueChange={(value) => {
            if (value) select({ style: value });
          }}
        >
          <SelectTrigger
            aria-labelledby={`${id}-style`}
            className="h-8.5 flex-1 border-site-hairline bg-site-surface text-[13px] font-medium text-site-ink focus-visible:border-site-hairline focus-visible:ring-site-accent/40 sm:w-36 sm:flex-none lg:hidden dark:bg-site-surface dark:hover:bg-site-surface"
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
    </div>
  );
}
