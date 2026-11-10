"use client";

import { cn } from "cn";
import * as React from "react";
import {
  RadioGroup as RadioGroupPrimitive,
  type RadioGroupProps as RadioGroupPrimitiveProps,
  Radio as RadioPrimitive,
} from "react-aria-components";

import { useControllableState } from "@/registry/bases/aria/hooks/use-controllable-state";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

function Rating({
  value: valueProp,
  defaultValue = 0,
  onChange,
  max = 5,
  className,
  ...props
}: Omit<
  RadioGroupPrimitiveProps,
  "value" | "defaultValue" | "onChange" | "children" | "className"
> & {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  max?: number;
  className?: string;
}) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onValueChange: onChange,
  });

  return (
    <RadioGroupPrimitive
      data-slot="rating"
      orientation="horizontal"
      value={value > 0 ? String(value) : null}
      onChange={(next) => setValue(Number(next))}
      className={cn("cn-rating flex w-fit items-center", className)}
      {...props}
    >
      {Array.from({ length: max }, (_, index) => (
        <RadioPrimitive
          key={index}
          data-slot="rating-item"
          data-active={index < value || undefined}
          value={String(index + 1)}
          aria-label={`${index + 1} ${index === 0 ? "star" : "stars"}`}
          className={cn(
            "cn-rating-item inline-flex shrink-0 items-center justify-center",
          )}
        >
          <IconPlaceholder
            lucide="StarIcon"
            tabler="IconStar"
            hugeicons="StarIcon"
            phosphor="StarIcon"
            remixicon="RiStarLine"
          />
        </RadioPrimitive>
      ))}
    </RadioGroupPrimitive>
  );
}

export { Rating };
