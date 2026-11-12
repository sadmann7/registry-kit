import { Button } from "@registry-kit/ui/components/button";
import { BlocksIcon } from "lucide-react";
import Link from "next/link";

import { GitHubIcon } from "@/components/github-icon";
import { ModeToggle } from "@/components/mode-toggle";
import { GITHUB_URL, SITE_NAME } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-chrome border-b border-border pt-[env(safe-area-inset-top,0px)]">
      <div className="flex h-15 items-center justify-between px-4 sm:h-17 sm:px-12">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-sm text-[15px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span
            aria-hidden
            className="flex size-5.5 items-center justify-center rounded-md bg-primary text-primary-foreground"
          >
            <BlocksIcon className="size-3.5" />
          </span>
          <span className="font-semibold tracking-[-0.02em] text-foreground">
            {SITE_NAME}
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            className="pointer-coarse:size-9"
            render={
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              />
            }
          >
            <GitHubIcon className="size-4" />
          </Button>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
