"use client";

import { Toaster } from "@registry-kit/ui/components/sonner";

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
      <ThemeShortcut />
      {children}
      <Toaster richColors />
    </ThemeProvider>
  );
}
