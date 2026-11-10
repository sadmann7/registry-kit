"use client";

import { Button } from "@registry-kit/ui/components/button";
import { cn } from "cn";
import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";

const ICON_CLASS_NAME =
  "absolute inset-0 size-3.5 transition-[opacity,scale,filter] duration-200 ease-snappy data-hidden:scale-50 data-hidden:opacity-0 data-hidden:blur-[2px] motion-reduce:scale-100 motion-reduce:blur-none";

// The site's own copy button. Registry items have theirs in
// `registry/bases/*/ui/copy-button.tsx`, which changes with the style.
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
        "border-site-hairline bg-site-surface text-site-ink hover:bg-site hover:text-site-ink dark:border-site-hairline dark:bg-site-surface dark:hover:bg-site",
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
          className={`${ICON_CLASS_NAME} text-site-accent`}
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
