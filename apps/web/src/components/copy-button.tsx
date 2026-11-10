"use client";

import { cn } from "cn";
import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";

// The site's own copy button. Registry items have theirs in
// `registry/bases/*/ui/copy-button.tsx`, which changes with the style.
export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-site-hairline bg-site-surface text-site-ink transition-colors outline-none hover:bg-site focus-visible:ring-2 focus-visible:ring-site-accent/40",
        className,
      )}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {}
      }}
    >
      {copied ? (
        <CheckIcon className="size-3.5 text-site-accent" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
    </button>
  );
}
