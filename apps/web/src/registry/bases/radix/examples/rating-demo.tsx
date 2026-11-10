"use client";

import * as React from "react";

import { Rating } from "@/registry/bases/radix/ui/rating";

export default function RatingDemo() {
  const [value, setValue] = React.useState(4);

  return (
    <div className="flex items-center gap-3">
      <Rating aria-label="Rating" value={value} onValueChange={setValue} />
      <span className="text-sm text-muted-foreground tabular-nums">
        {value} of 5
      </span>
    </div>
  );
}
