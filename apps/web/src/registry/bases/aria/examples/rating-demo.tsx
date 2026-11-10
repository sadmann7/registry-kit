"use client";

import * as React from "react";

import { Rating } from "@/registry/bases/aria/ui/rating";

export default function RatingDemo() {
  const [value, setValue] = React.useState(4);

  return (
    <div className="flex items-center gap-3">
      <Rating aria-label="Rating" value={value} onChange={setValue} />
      <span className="text-sm text-muted-foreground tabular-nums">
        {value} of 5
      </span>
    </div>
  );
}
