"use client";

import { cn } from "cn";
import * as React from "react";
import {
  Link as LinkPrimitive,
  type LinkProps as LinkPrimitiveProps,
} from "react-aria-components";

import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

function Announcement({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="announcement"
      className={cn(
        "cn-announcement group/announcement inline-flex w-fit items-center",
        className,
      )}
      {...props}
    />
  );
}

function AnnouncementLink({
  className,
  ...props
}: Omit<LinkPrimitiveProps, "className"> & { className?: string }) {
  return (
    <LinkPrimitive
      data-slot="announcement"
      className={cn(
        "cn-announcement group/announcement inline-flex w-fit items-center",
        className,
      )}
      {...props}
    />
  );
}

function AnnouncementTag({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="announcement-tag"
      className={cn("cn-announcement-tag shrink-0", className)}
      {...props}
    />
  );
}

function AnnouncementTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="announcement-title"
      className={cn(
        "cn-announcement-title inline-flex items-center",
        className,
      )}
      {...props}
    >
      {children}
      <IconPlaceholder
        lucide="ArrowRightIcon"
        tabler="IconArrowRight"
        hugeicons="ArrowRight02Icon"
        phosphor="ArrowRightIcon"
        remixicon="RiArrowRightLine"
        className="cn-rtl-flip"
      />
    </span>
  );
}

export { Announcement, AnnouncementLink, AnnouncementTag, AnnouncementTitle };
