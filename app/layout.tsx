import type React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, DM_Sans, DM_Mono, Syne } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["300","400","500","600","700"] });
const dmMono = DM_Mono({ subsets: ["latin"], variable: "--font-dm-mono", weight: ["400","500"] });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["400","500","600","700"] });

export const metadata: Metadata = {
  title: "AIT ARC",
  description: "Automated Recovery Centre",
  generator: "v0.app",
  icons: {
    icon: "/ait.png",
    apple: "/ait.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${dmSans.variable} ${dmMono.variable} ${syne.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="light" storageKey="campaignhub-theme">
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
