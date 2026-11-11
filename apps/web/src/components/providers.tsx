"use client";

import { Toaster } from "@registry-kit/ui/components/sonner";

import { ThemeColor } from "@/components/theme-color";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeShortcut } from "@/components/theme-shortcut";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeColor />
      <ThemeShortcut />
      {children}
      <div className="site-chrome">
        <Toaster richColors />
      </div>
    </ThemeProvider>
  );
}
