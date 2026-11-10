import type * as React from "react";

import BaseCopyButtonDemo from "@/registry/bases/base/examples/copy-button-demo";
import BaseTimelineDemo from "@/registry/bases/base/examples/timeline-demo";
import RadixCopyButtonDemo from "@/registry/bases/radix/examples/copy-button-demo";
import RadixTimelineDemo from "@/registry/bases/radix/examples/timeline-demo";
import type { BaseName } from "@/registry/config";

// Demos shown in the preview, by base and item name. Items without one (like
// hooks) are listed without a preview.
export const EXAMPLES: Record<BaseName, Record<string, React.ComponentType>> = {
  radix: { timeline: RadixTimelineDemo, "copy-button": RadixCopyButtonDemo },
  base: { timeline: BaseTimelineDemo, "copy-button": BaseCopyButtonDemo },
};
