import type { Metadata } from "next";

import "../index.css";
import Providers from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { fontMono, fontSans } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "acme registry",
  description: "A shadcn registry built for every base and style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} bg-site text-site-ink antialiased`}
      >
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
