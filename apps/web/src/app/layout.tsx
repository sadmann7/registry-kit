import type { Metadata, Viewport } from "next";

import "../index.css";
import Providers from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { fontMono, fontSans } from "@/lib/fonts";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} registry`,
  description: "A shadcn registry built for every base and style.",
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
