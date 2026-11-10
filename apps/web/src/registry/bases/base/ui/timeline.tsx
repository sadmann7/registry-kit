import * as React from "react";
import { cn } from "cn";

function Timeline({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol data-slot="timeline" className={cn("cn-timeline flex flex-col", className)} {...props} />
  );
}

function TimelineItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="timeline-item"
      className={cn("cn-timeline-item relative border-l pl-6 last:border-transparent", className)}
      {...props}
    />
  );
}

function TimelineDot({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="timeline-dot"
      aria-hidden="true"
      className={cn("cn-timeline-dot absolute top-1 left-0 -translate-x-1/2", className)}
      {...props}
    />
  );
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3 data-slot="timeline-title" className={cn("cn-timeline-title", className)} {...props} />
  );
}

function TimelineDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="timeline-description"
      className={cn("cn-timeline-description", className)}
      {...props}
    />
  );
}

function TimelineTime({ className, ...props }: React.ComponentProps<"time">) {
  return (
    <time
      data-slot="timeline-time"
      className={cn("cn-timeline-time block", className)}
      {...props}
    />
  );
}

export { Timeline, TimelineDescription, TimelineDot, TimelineItem, TimelineTime, TimelineTitle };
