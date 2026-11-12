import { cn } from "cn";
import * as React from "react";

import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

function StatCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-card"
      className={cn("cn-stat-card flex flex-col", className)}
      {...props}
    />
  );
}

function StatCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-card-header"
      className={cn(
        "cn-stat-card-header flex items-center justify-between",
        className,
      )}
      {...props}
    />
  );
}

function StatCardLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-card-label"
      className={cn("cn-stat-card-label", className)}
      {...props}
    />
  );
}

function StatCardDelta({
  trend = "up",
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { trend?: "up" | "down" }) {
  return (
    <span
      data-slot="stat-card-delta"
      data-trend={trend}
      className={cn(
        "cn-stat-card-delta inline-flex shrink-0 items-center",
        className,
      )}
      {...props}
    >
      {trend === "up" ? (
        <IconPlaceholder
          lucide="ArrowUpRightIcon"
          tabler="IconArrowUpRight"
          hugeicons="ArrowUpRight01Icon"
          phosphor="ArrowUpRightIcon"
          remixicon="RiArrowRightUpLine"
        />
      ) : (
        <IconPlaceholder
          lucide="ArrowDownRightIcon"
          tabler="IconArrowDownRight"
          hugeicons="ArrowDownRight01Icon"
          phosphor="ArrowDownRightIcon"
          remixicon="RiArrowRightDownLine"
        />
      )}
      <span className="sr-only">{trend === "up" ? "Up" : "Down"}</span>
      {children}
    </span>
  );
}

function StatCardValue({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-card-value"
      className={cn("cn-stat-card-value tabular-nums", className)}
      {...props}
    />
  );
}

function StatCardCaption({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="stat-card-caption"
      className={cn("cn-stat-card-caption", className)}
      {...props}
    />
  );
}

// The last bar is the current period. It's decoration, so the value and
// caption carry the meaning.
function StatCardSparkline({
  data,
  className,
  ...props
}: React.ComponentProps<"div"> & { data: readonly number[] }) {
  // A NaN or infinite value would stretch every other bar.
  const values = data.map((value) =>
    Number.isFinite(value) ? Math.max(value, 0) : 0,
  );
  const max = values.reduce((a, b) => Math.max(a, b), 0) || 1;

  return (
    <div
      data-slot="stat-card-sparkline"
      aria-hidden="true"
      className={cn("cn-stat-card-sparkline flex items-end", className)}
      {...props}
    >
      {values.map((value, index) => (
        <span
          key={index}
          data-current={index === values.length - 1 || undefined}
          className="cn-stat-card-bar flex-1"
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

export {
  StatCard,
  StatCardCaption,
  StatCardDelta,
  StatCardHeader,
  StatCardLabel,
  StatCardSparkline,
  StatCardValue,
};
