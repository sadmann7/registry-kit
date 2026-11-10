"use client";

import { cn } from "cn";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import * as React from "react";

import { useControllableState } from "@/registry/bases/radix/hooks/use-controllable-state";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

function Rating({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  max = 5,
  className,
  onPointerLeave,
  ...props
}: Omit<
  React.ComponentProps<typeof RadioGroupPrimitive.Root>,
  "value" | "defaultValue" | "onValueChange" | "children"
> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
}) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onValueChange,
  });
  const [hovered, setHovered] = React.useState<number | null>(null);
  const shown = hovered ?? value;

  return (
    <RadioGroupPrimitive.Root
      data-slot="rating"
      orientation="horizontal"
      value={value > 0 ? String(value) : ""}
      onValueChange={(next) => setValue(Number(next))}
      data-hovering={hovered !== null || undefined}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setHovered(null);
      }}
      className={cn("cn-rating flex w-fit items-center", className)}
      {...props}
    >
      {Array.from({ length: max }, (_, index) => (
        <RadioGroupPrimitive.Item
          key={index}
          data-slot="rating-item"
          data-active={index < shown || undefined}
          value={String(index + 1)}
          // Previews the rating under the mouse, not under a finger.
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setHovered(index + 1);
          }}
          aria-label={`${index + 1} ${index === 0 ? "star" : "stars"}`}
          className="cn-rating-item inline-flex shrink-0 items-center justify-center"
        >
          <IconPlaceholder
            lucide="StarIcon"
            tabler="IconStar"
            hugeicons="StarIcon"
            phosphor="StarIcon"
            remixicon="RiStarLine"
          />
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}

export { Rating };
