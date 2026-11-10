"use client";

import { cn } from "cn";
import * as React from "react";

import { useCopyToClipboard } from "@/registry/bases/aria/hooks/use-copy-to-clipboard";
import { Button } from "@/registry/bases/aria/ui/button";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

function CopyButton({
  value,
  className,
  variant = "ghost",
  size = "icon-sm",
  onPress,
  ...props
}: React.ComponentProps<typeof Button> & { value: string }) {
  const { copy, isCopied } = useCopyToClipboard();

  return (
    <Button
      data-slot="copy-button"
      data-copied={isCopied || undefined}
      variant={variant}
      size={size}
      className={cn("cn-copy-button", className)}
      onPress={(event) => {
        onPress?.(event);
        void copy(value);
      }}
      {...props}
    >
      {isCopied ? (
        <IconPlaceholder
          lucide="CheckIcon"
          tabler="IconCheck"
          hugeicons="Tick02Icon"
          phosphor="CheckIcon"
          remixicon="RiCheckLine"
        />
      ) : (
        <IconPlaceholder
          lucide="CopyIcon"
          tabler="IconCopy"
          hugeicons="Copy01Icon"
          phosphor="CopyIcon"
          remixicon="RiFileCopyLine"
        />
      )}
      <span className="sr-only">{isCopied ? "Copied" : "Copy"}</span>
    </Button>
  );
}

export { CopyButton };
