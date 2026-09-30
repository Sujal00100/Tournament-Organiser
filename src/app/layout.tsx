import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Arena | Tournament Organizer",
    template: "%s | Arena",
  },
  description:
    "Organize and manage gaming tournaments with automatic bracket generation, live scoring, and real-time updates.",
  keywords: [
    "tournament",
    "esports",
    "gaming",
    "bracket",
    "organizer",
    "competition",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="gaming-bg" aria-hidden="true" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
