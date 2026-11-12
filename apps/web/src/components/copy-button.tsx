"use client";

import { Button } from "@registry-kit/ui/components/button";
import { cn } from "cn";
import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";

const ICON_CLASS_NAME =
  "absolute inset-0 size-3.5 transition-[opacity,scale,filter] duration-200 ease-snappy data-hidden:scale-50 data-hidden:opacity-0 data-hidden:blur-[2px] motion-reduce:scale-100 motion-reduce:blur-none";

export function CopyButton({
  value,
  label = "Copy",
  className,
  children,
}: {
  value: string;
  label?: string;
  className?: string;
  // Visible text next to the icon. Screen readers hear "Copy" before it, so
  // the accessible name still contains what's on screen.
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <Button
      variant="outline"
      size={children ? "sm" : "icon-sm"}
      aria-label={children ? undefined : copied ? "Copied" : label}
      className={cn(
        children
          ? "font-mono text-xs font-normal pointer-coarse:h-9"
          : "pointer-coarse:size-9",
        "border-border bg-card text-foreground hover:bg-background hover:text-foreground dark:border-border dark:bg-card dark:hover:bg-background",
        className,
      )}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {}
      }}
    >
      {/* Both icons stay mounted, so the swap crossfades instead of popping. */}
      <span className="relative size-3.5">
        <CopyIcon
          data-hidden={copied || undefined}
          className={ICON_CLASS_NAME}
        />
        <CheckIcon
          data-hidden={!copied || undefined}
          className={ICON_CLASS_NAME}
        />
      </span>
      {children && (
        <>
          <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
          {children}
        </>
      )}
    </Button>
  );
}
