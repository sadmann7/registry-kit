"use client";

import { useTheme } from "next-themes";
import * as React from "react";

// The theme-color tags follow the OS color scheme, but the theme can be set
// by hand. Point the tag for the active theme at every scheme instead.
export function ThemeColor() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (!resolvedTheme) return;

    for (const meta of document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]',
    )) {
      meta.dataset.scheme ??= meta.media.includes("dark") ? "dark" : "light";
      meta.media = meta.dataset.scheme === resolvedTheme ? "all" : "not all";
    }
  }, [resolvedTheme]);

  return null;
}
