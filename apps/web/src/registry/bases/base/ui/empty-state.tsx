import { cn } from "cn";
import * as React from "react";

function EmptyState({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "cn-empty-state flex flex-col items-center text-center text-balance",
        className,
      )}
      {...props}
    />
  );
}

function EmptyStateIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state-icon"
      aria-hidden="true"
      className={cn(
        "cn-empty-state-icon flex shrink-0 items-center justify-center",
        className,
      )}
      {...props}
    />
  );
}

function EmptyStateTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="empty-state-title"
      className={cn("cn-empty-state-title cn-font-heading", className)}
      {...props}
    />
  );
}

function EmptyStateDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-state-description"
      className={cn("cn-empty-state-description", className)}
      {...props}
    />
  );
}

function EmptyStateActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state-actions"
      className={cn(
        "cn-empty-state-actions flex flex-wrap items-center justify-center",
        className,
      )}
      {...props}
    />
  );
}

export {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
};
