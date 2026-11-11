"use client";

import * as React from "react";

import { FieldDescription, FieldLabel } from "@/registry/bases/base/ui/field";
import {
  NumberField,
  NumberFieldAddon,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldStepper,
} from "@/registry/bases/base/ui/number-field";

export default function NumberFieldDemo() {
  const id = React.useId();

  return (
    <div className="flex flex-wrap justify-center gap-8">
      <NumberField id={`${id}-quantity`} defaultValue={2} min={1} max={10}>
        <FieldLabel htmlFor={`${id}-quantity`}>Quantity</FieldLabel>
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput aria-describedby={`${id}-quantity-hint`} />
          <NumberFieldIncrement />
        </NumberFieldGroup>
        <FieldDescription id={`${id}-quantity-hint`}>
          Between 1 and 10.
        </FieldDescription>
      </NumberField>

      <NumberField
        id={`${id}-price`}
        defaultValue={24}
        min={0}
        step={0.5}
        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
      >
        <FieldLabel htmlFor={`${id}-price`}>Price</FieldLabel>
        <NumberFieldGroup className="w-46">
          <NumberFieldAddon>$</NumberFieldAddon>
          <NumberFieldInput
            aria-describedby={`${id}-price-hint`}
            className="w-auto flex-1 text-start"
          />
          <NumberFieldStepper />
        </NumberFieldGroup>
        <FieldDescription id={`${id}-price-hint`}>
          USD, in steps of 0.50.
        </FieldDescription>
      </NumberField>
    </div>
  );
}
