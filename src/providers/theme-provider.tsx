// ═══════════════════════════════════════════════════════════
// Theme Provider
// Uses next-themes for dark mode (always dark in this app)
// ═══════════════════════════════════════════════════════════

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
