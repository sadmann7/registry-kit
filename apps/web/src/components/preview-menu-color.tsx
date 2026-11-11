"use client";

import * as React from "react";

import type { MenuColor } from "@/lib/design-system";

// Does in the preview what the shadcn CLI does to `cn-menu-target` and
// `cn-menu-translucent` on install: inverted menus get `dark`, and only
// translucent ones keep the translucent class. A data attribute marks the
// ones it took off, so a later change can put it back.
export function PreviewMenuColor({ menuColor }: { menuColor: MenuColor }) {
  React.useLayoutEffect(() => {
    const inverted = menuColor.startsWith("inverted");
    const translucent = menuColor.endsWith("-translucent");
    let frame = 0;

    function update() {
      for (const element of document.querySelectorAll<HTMLElement>(
        ".cn-menu-target, .cn-menu-translucent, [data-menu-translucent]",
      )) {
        if (
          element.closest(".site-chrome") &&
          !element.closest("[data-preview]")
        )
          continue;
        if (element.classList.contains("cn-menu-target")) {
          element.classList.toggle("dark", inverted);
        }
        if (translucent && element.hasAttribute("data-menu-translucent")) {
          element.classList.add("cn-menu-translucent");
          element.removeAttribute("data-menu-translucent");
        } else if (
          !translucent &&
          element.classList.contains("cn-menu-translucent")
        ) {
          element.classList.remove("cn-menu-translucent");
          element.setAttribute("data-menu-translucent", "");
        }
      }
    }

    update();
    const observer = new MutationObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [menuColor]);

  return null;
}
