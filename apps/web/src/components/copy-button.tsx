"use client";

import { Button } from "@registry-kit/ui/components/button";
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
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={copied ? "Copied" : label}
      className={cn(
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
      {copied ? (
        <CheckIcon className="size-3.5 text-site-accent" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
    </Button>
  );
}
