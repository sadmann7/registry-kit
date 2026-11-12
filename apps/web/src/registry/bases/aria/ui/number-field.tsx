"use client";

import { cn } from "cn";
import * as React from "react";
import {
  Button as ButtonPrimitive,
  type ButtonProps,
  Group as GroupPrimitive,
  type GroupProps,
  Input as InputPrimitive,
  type InputProps,
  NumberField as NumberFieldPrimitive,
  type NumberFieldProps,
} from "react-aria-components";

import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

function NumberField({
  className,
  ...props
}: Omit<NumberFieldProps, "className"> & { className?: string }) {
  return (
    <NumberFieldPrimitive
      data-slot="number-field"
      className={cn("cn-number-field flex w-fit flex-col", className)}
      {...props}
    />
  );
}

function NumberFieldGroup({
  className,
  ...props
}: Omit<GroupProps, "className"> & { className?: string }) {
  return (
    <GroupPrimitive
      data-slot="number-field-group"
      className={cn(
        "cn-number-field-group flex w-fit items-stretch",
        className,
      )}
      {...props}
    />
  );
}

function NumberFieldInput({
  className,
  ...props
}: Omit<InputProps, "className"> & { className?: string }) {
  return (
    <InputPrimitive
      data-slot="number-field-input"
      className={cn("cn-number-field-input min-w-0 tabular-nums", className)}
      {...props}
    />
  );
}

function NumberFieldDecrement({
  className,
  children,
  ...props
}: Omit<ButtonProps, "className" | "slot"> & { className?: string }) {
  return (
    <ButtonPrimitive
      slot="decrement"
      data-slot="number-field-decrement"
      className={cn(
        "cn-number-field-button inline-flex shrink-0 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children ?? (
        <IconPlaceholder
          lucide="MinusIcon"
          tabler="IconMinus"
          hugeicons="MinusSignIcon"
          phosphor="MinusIcon"
          remixicon="RiSubtractLine"
        />
      )}
    </ButtonPrimitive>
  );
}

function NumberFieldIncrement({
  className,
  children,
  ...props
}: Omit<ButtonProps, "className" | "slot"> & { className?: string }) {
  return (
    <ButtonPrimitive
      slot="increment"
      data-slot="number-field-increment"
      className={cn(
        "cn-number-field-button inline-flex shrink-0 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children ?? (
        <IconPlaceholder
          lucide="PlusIcon"
          tabler="IconPlus"
          hugeicons="PlusSignIcon"
          phosphor="PlusIcon"
          remixicon="RiAddLine"
        />
      )}
    </ButtonPrimitive>
  );
}

function NumberFieldAddon({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="number-field-addon"
      className={cn(
        "cn-number-field-addon flex shrink-0 items-center justify-center",
        className,
      )}
      {...props}
    />
  );
}

function NumberFieldStepper({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="number-field-stepper"
      className={cn(
        "cn-number-field-stepper flex shrink-0 flex-col",
        className,
      )}
      {...props}
    >
      <NumberFieldIncrement>
        <IconPlaceholder
          lucide="ChevronUpIcon"
          tabler="IconChevronUp"
          hugeicons="ArrowUp01Icon"
          phosphor="CaretUpIcon"
          remixicon="RiArrowUpSLine"
        />
      </NumberFieldIncrement>
      <NumberFieldDecrement>
        <IconPlaceholder
          lucide="ChevronDownIcon"
          tabler="IconChevronDown"
          hugeicons="ArrowDown01Icon"
          phosphor="CaretDownIcon"
          remixicon="RiArrowDownSLine"
        />
      </NumberFieldDecrement>
    </div>
  );
}

export {
  NumberField,
  NumberFieldAddon,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldStepper,
};
