import { Button } from "@registry-kit/ui/components/button";
import Link from "next/link";

import { GitHubIcon } from "@/components/github-icon";
import { ModeToggle } from "@/components/mode-toggle";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-site-hairline">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-12">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-sm text-[15px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span aria-hidden className="size-4.5 rounded-[4px] bg-site-ink" />
          <span className="font-semibold text-site-ink">{siteConfig.name}</span>
          <span className="text-site-muted">registry</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            nativeButton={false}
            className="pointer-coarse:size-9"
            render={
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              />
            }
          >
            <GitHubIcon />
          </Button>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
