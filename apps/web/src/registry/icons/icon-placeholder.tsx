import type * as React from "react";

import * as icons from "@/registry/__generated__/icons";

// Stands in for an icon in registry source. The shadcn CLI replaces it with
// the icon from the project's `iconLibrary` on install. The preview always
// renders the lucide icon.
function IconPlaceholder({
  lucide,
  tabler: _tabler,
  hugeicons: _hugeicons,
  phosphor: _phosphor,
  remixicon: _remixicon,
  ...props
}: React.ComponentProps<"svg"> & {
  lucide: string;
  tabler?: string;
  hugeicons?: string;
  phosphor?: string;
  remixicon?: string;
}) {
  const Icon = (
    icons as Record<string, React.ComponentType<React.ComponentProps<"svg">> | undefined>
  )[lucide];
  return Icon ? <Icon {...props} /> : null;
}

export { IconPlaceholder };
