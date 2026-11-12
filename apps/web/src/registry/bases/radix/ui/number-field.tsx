"use client";

import { cn } from "cn";
import * as React from "react";

import { useControllableState } from "@/registry/bases/radix/hooks/use-controllable-state";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

// Radix has no number field primitive, so this one keeps its own state and
// exposes the input as a spinbutton.
interface NumberFieldContextValue {
  inputId: string;
  value: number | null;
  min: number;
  max: number;
  disabled: boolean;
  format: (value: number) => string;
  parse: (text: string) => number;
  commit: (next: number | null) => void;
  stepFrom: (from: number | null, direction: 1 | -1) => void;
}

const NumberFieldContext = React.createContext<NumberFieldContextValue | null>(
  null,
);

function useNumberField() {
  const context = React.useContext(NumberFieldContext);
  if (!context) {
    throw new Error("NumberField parts must be used within <NumberField>");
  }
  return context;
}

// Reads text in the formatter's locale, like "1.024,5" in de-DE or "١٢٣٤٫٥" in
// ar-EG, and NaN for text without a number in it.
function parseNumber(text: string, formatter: Intl.NumberFormat) {
  const { locale, numberingSystem, style } = formatter.resolvedOptions();
  const parts = new Intl.NumberFormat(locale, {
    numberingSystem,
    useGrouping: true,
  }).formatToParts(-11111.1);
  const group = parts.find((part) => part.type === "group")?.value;
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? ".";
  const digits = new Intl.NumberFormat(locale, {
    numberingSystem,
    useGrouping: false,
  }).format(9876543210);

  let normalized = text.replaceAll("−", "-");
  for (const [index, digit] of [...digits].entries())
    normalized = normalized.replaceAll(digit, String(9 - index));
  if (group) normalized = normalized.replaceAll(group, "");
  normalized = normalized.replaceAll(decimal, ".").replace(/[^\d.-]/g, "");
  if (!/\d/.test(normalized)) return Number.NaN;

  const parsed = Number(normalized);
  // A percent field shows 0.5 as "50%".
  return style === "percent" ? Number((parsed / 100).toPrecision(12)) : parsed;
}

function NumberField({
  id,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled = false,
  format,
  locale = "en-US",
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  format?: Intl.NumberFormatOptions;
  locale?: string;
}) {
  const formatter = new Intl.NumberFormat(locale, {
    useGrouping: false,
    ...format,
  });
  const generatedId = React.useId();
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onValueChange,
  });

  function commit(next: number | null) {
    const clamped = next === null ? null : Math.min(Math.max(next, min), max);
    if (clamped !== value) setValue(clamped);
  }

  return (
    <NumberFieldContext
      value={{
        // Like Base UI, `id` goes to the input so a label can point at it.
        inputId: id ?? generatedId,
        value,
        min,
        max,
        disabled,
        format: (next) => formatter.format(next),
        parse: (text) => parseNumber(text, formatter),
        commit,
        stepFrom: (from, direction) =>
          // Rounds away float noise like 0.1 + 0.2.
          commit(Number(((from ?? 0) + direction * step).toPrecision(12))),
      }}
    >
      <div
        data-slot="number-field"
        data-disabled={disabled || undefined}
        className={cn("cn-number-field flex w-fit flex-col", className)}
        {...props}
      />
    </NumberFieldContext>
  );
}

function NumberFieldGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { disabled } = useNumberField();

  return (
    <div
      role="group"
      data-slot="number-field-group"
      data-disabled={disabled || undefined}
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
  onChange,
  onBlur,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "type">) {
  const field = useNumberField();
  const [draft, setDraft] = React.useState<string | null>(null);

  function parseDraft() {
    if (draft === null) return field.value;
    if (draft.trim() === "") return null;
    const parsed = field.parse(draft);
    return Number.isNaN(parsed) ? field.value : parsed;
  }

  function commitDraft() {
    field.commit(parseDraft());
    setDraft(null);
  }

  return (
    <input
      id={field.inputId}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      role="spinbutton"
      aria-valuenow={field.value ?? undefined}
      aria-valuemin={Number.isFinite(field.min) ? field.min : undefined}
      aria-valuemax={Number.isFinite(field.max) ? field.max : undefined}
      disabled={field.disabled}
      value={draft ?? (field.value === null ? "" : field.format(field.value))}
      data-slot="number-field-input"
      className={cn("cn-number-field-input min-w-0 tabular-nums", className)}
      onChange={(event) => {
        onChange?.(event);
        setDraft(event.target.value);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        commitDraft();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;

        if (event.key === "Enter") {
          commitDraft();
        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
          field.stepFrom(parseDraft(), event.key === "ArrowUp" ? 1 : -1);
          setDraft(null);
        } else if (event.key === "Home" && Number.isFinite(field.min)) {
          event.preventDefault();
          field.commit(field.min);
          setDraft(null);
        } else if (event.key === "End" && Number.isFinite(field.max)) {
          event.preventDefault();
          field.commit(field.max);
          setDraft(null);
        }
      }}
      {...props}
    />
  );
}

function NumberFieldStepButton({
  direction,
  className,
  onClick,
  ...props
}: React.ComponentProps<"button"> & { direction: 1 | -1 }) {
  const field = useNumberField();
  const atLimit =
    field.value !== null &&
    (direction > 0 ? field.value >= field.max : field.value <= field.min);

  return (
    <button
      type="button"
      // The input is the tab stop; arrow keys step from there.
      tabIndex={-1}
      aria-controls={field.inputId}
      disabled={field.disabled || atLimit}
      className={cn(
        "cn-number-field-button inline-flex shrink-0 items-center justify-center",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) field.stepFrom(field.value, direction);
      }}
      {...props}
    />
  );
}

function NumberFieldDecrement({
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <NumberFieldStepButton
      direction={-1}
      data-slot="number-field-decrement"
      aria-label="Decrease"
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
    </NumberFieldStepButton>
  );
}

function NumberFieldIncrement({
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <NumberFieldStepButton
      direction={1}
      data-slot="number-field-increment"
      aria-label="Increase"
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
    </NumberFieldStepButton>
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
