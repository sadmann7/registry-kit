import type * as React from "react";

import type { BaseName } from "@/registry/config";

import AriaCopyButtonDemo from "@/registry/bases/aria/examples/copy-button-demo";
import AriaTimelineDemo from "@/registry/bases/aria/examples/timeline-demo";
import BaseCopyButtonDemo from "@/registry/bases/base/examples/copy-button-demo";
import BaseTimelineDemo from "@/registry/bases/base/examples/timeline-demo";
import RadixCopyButtonDemo from "@/registry/bases/radix/examples/copy-button-demo";
import RadixTimelineDemo from "@/registry/bases/radix/examples/timeline-demo";

// Demos shown in the preview, by base and item name.
export const EXAMPLES: Record<BaseName, Record<string, React.ComponentType>> = {
  radix: { timeline: RadixTimelineDemo, "copy-button": RadixCopyButtonDemo },
  base: { timeline: BaseTimelineDemo, "copy-button": BaseCopyButtonDemo },
  aria: { timeline: AriaTimelineDemo, "copy-button": AriaCopyButtonDemo },
};

// Usage shown for items that have nothing to render, like hooks.
export const USAGE: Record<string, string> = {
  "use-copy-to-clipboard": `const { copy, isCopied } = useCopyToClipboard()

<Button onClick={() => copy(value)}>
  {isCopied ? "Copied" : "Copy"}
</Button>`,
};
