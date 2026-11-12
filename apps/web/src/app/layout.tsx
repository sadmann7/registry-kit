import type { Metadata, Viewport } from "next";

import { cn } from "cn";

import "../globals.css";
import Providers from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SkipNav } from "@/components/skip-nav";
import { fontMono, fontSans } from "@/lib/fonts";
import { previewFontVariables } from "@/lib/preview-fonts";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { REGISTRIES } from "@/registry/__generated__/registries";
import { DEFAULT_BASE } from "@/registry/config";

export const metadata: Metadata = {
  metadataBase: new URL(REGISTRIES[DEFAULT_BASE].homepage),
  title: `${SITE_NAME} | An example registry for every base and style`,
  description: SITE_DESCRIPTION,
};

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
