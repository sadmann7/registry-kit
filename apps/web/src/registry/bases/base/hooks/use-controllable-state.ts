import * as React from "react";

// State that the parent can own through `value`, or leave to the component
// with `defaultValue`.
function useControllableState<T>({
  value: valueProp,
  defaultValue,
  onValueChange,
}: {
  value?: T;
  defaultValue: T;
  onValueChange?: (value: T) => void;
}) {
  const [state, setState] = React.useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : state;

  const onValueChangeRef = React.useRef(onValueChange);
  React.useEffect(() => {
    onValueChangeRef.current = onValueChange;
  });

  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) setState(next);
      onValueChangeRef.current?.(next);
    },
    [isControlled],
  );

  return [value, setValue] as const;
}

export { useControllableState };
