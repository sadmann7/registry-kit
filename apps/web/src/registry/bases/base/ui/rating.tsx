"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { cn } from "cn";
import * as React from "react";

import { useControllableState } from "@/registry/bases/base/hooks/use-controllable-state";
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
  RadioGroupPrimitive.Props,
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
    <RadioGroupPrimitive
      data-slot="rating"
      value={value}
      onValueChange={(next: number) => setValue(next)}
      data-hovering={hovered !== null || undefined}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setHovered(null);
      }}
      className={cn("cn-rating flex w-fit items-center", className)}
      {...props}
    >
      {Array.from({ length: max }, (_, index) => (
        <RadioPrimitive.Root
          key={index}
          data-slot="rating-item"
          data-active={index < shown || undefined}
          value={index + 1}
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
        </RadioPrimitive.Root>
      ))}
    </RadioGroupPrimitive>
  );
}

export { Rating };
