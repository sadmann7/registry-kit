"use client";

import type { IconLibraryName } from "shadcn/icons";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import * as React from "react";

import { ICONS } from "@/registry/__generated__/icons";

const IconLibraryContext = React.createContext<IconLibraryName>("lucide");

function IconLibraryProvider({
  iconLibrary,
  children,
}: {
  iconLibrary: IconLibraryName;
  children: React.ReactNode;
}) {
  return (
    <IconLibraryContext value={iconLibrary}>{children}</IconLibraryContext>
  );
}

// Stands in for an icon in registry source. The shadcn CLI replaces it with
// the icon from the project's `iconLibrary` on install. The preview renders
// the icon from the library its `IconLibraryProvider` names.
function IconPlaceholder({
  lucide,
  tabler,
  hugeicons,
  phosphor,
  remixicon,
  ...props
}: React.ComponentProps<"svg"> & {
  // The CLI leaves a placeholder without a name for the project's library.
  lucide: string;
  tabler: string;
  hugeicons: string;
  phosphor: string;
  remixicon: string;
}) {
  const iconLibrary = React.use(IconLibraryContext);
  const name = { lucide, tabler, hugeicons, phosphor, remixicon }[iconLibrary];
  const icon = ICONS[iconLibrary][name];
  if (!icon) return null;

  // Hugeicons exports icon data, rendered the way the CLI writes it.
  if (iconLibrary === "hugeicons") {
    return (
      <HugeiconsIcon
        icon={icon as IconSvgElement}
        strokeWidth={2}
        {...(props as Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">)}
      />
    );
  }
  const Icon = icon as React.ComponentType<React.ComponentProps<"svg">>;
  return <Icon {...props} />;
}

export { IconLibraryProvider, IconPlaceholder };
