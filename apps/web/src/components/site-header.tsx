import Link from "next/link";

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
        <nav className="flex items-center gap-6 text-[13px] text-site-muted">
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-sm transition-colors outline-none hover:text-site-ink focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            GitHub
          </a>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
