import type { Metadata, Viewport } from "next";

import "../index.css";
import Providers from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { fontMono, fontSans } from "@/lib/fonts";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  // Like "Acme | ...", from the registry's name.
  title: `${siteConfig.name.charAt(0).toUpperCase()}${siteConfig.name.slice(1)} | An example registry for every base and style`,
  description:
    "Components, hooks and utilities for shadcn/ui. Each one installs in your project's base and style, with RTL support.",
};

// The status bar matches the header, which uses --background.
export const viewport: Viewport = {
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
      className={`${fontSans.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground antialiased">
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
