"use client";

import * as React from "react";

// Puts the style class on <body> too, so content portaled out of the preview
// (popovers, menus, dialogs) is styled the same way.
export function StyleClass({ style }: { style: string }) {
  React.useEffect(() => {
    document.body.classList.add(`style-${style}`);
    return () => document.body.classList.remove(`style-${style}`);
  }, [style]);

  return null;
}
