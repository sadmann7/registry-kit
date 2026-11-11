import type { Metadata, Viewport } from "next";

import { cn } from "cn";

import "../index.css";
import Providers from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SkipNav } from "@/components/skip-nav";
import { fontMono, fontSans } from "@/lib/fonts";
import { previewFontVariables } from "@/lib/preview-fonts";
import { siteConfig, siteTitle } from "@/lib/site";
import { REGISTRIES } from "@/registry/__generated__/registries";
import { DEFAULT_BASE } from "@/registry/config";

export const metadata: Metadata = {
  // The registry is served from the site, so the homepage is its URL too.
  // Vercel would otherwise use the production URL, other hosts localhost.
  metadataBase: new URL(REGISTRIES[DEFAULT_BASE].homepage),
  title: `${siteTitle} | An example registry for every base and style`,
  description: siteConfig.description,
};

// The status bar matches the header, which uses --background.
export const viewport: Viewport = {
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The font variables go on <html>, so the theme's --font-sans and
    // --font-mono resolve on every element, including bare <code> and <pre>.
    <html
      lang="en"
      className={cn(fontSans.variable, fontMono.variable, previewFontVariables)}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground antialiased">
        <Providers>
          <SkipNav />
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
