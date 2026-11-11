"use client";

import * as React from "react";

import { FieldDescription, FieldLabel } from "@/registry/bases/aria/ui/field";
import {
  NumberField,
  NumberFieldAddon,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldStepper,
} from "@/registry/bases/aria/ui/number-field";

export default function NumberFieldDemo() {
  const id = React.useId();

  // React Aria wires each label to its input itself.
  return (
    <div className="flex flex-wrap justify-center gap-8">
      <NumberField
        defaultValue={2}
        minValue={1}
        maxValue={10}
        aria-describedby={`${id}-quantity-hint`}
      >
        <FieldLabel>Quantity</FieldLabel>
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldGroup>
        <FieldDescription id={`${id}-quantity-hint`}>
          Between 1 and 10.
        </FieldDescription>
      </NumberField>

      <NumberField
        defaultValue={24}
        minValue={0}
        step={0.5}
        formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
        aria-describedby={`${id}-price-hint`}
      >
        <FieldLabel>Price</FieldLabel>
        <NumberFieldGroup className="w-46">
          <NumberFieldAddon>$</NumberFieldAddon>
          <NumberFieldInput className="w-auto flex-1 text-start" />
          <NumberFieldStepper />
        </NumberFieldGroup>
        <FieldDescription id={`${id}-price-hint`}>
          USD, in steps of 0.50.
        </FieldDescription>
      </NumberField>
    </div>
  );
}
