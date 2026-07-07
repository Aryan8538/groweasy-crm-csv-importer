import type { Metadata } from "next";
import { Inter, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "GrowEasy | AI-Powered CRM CSV Lead Importer",
  description:
    "Intelligently map, clean, and normalize messy CSV lead spreadsheets into GrowEasy's strict 15-field CRM schema using AI.",
  keywords: "lead management, crm, csv importer, ai parser, real estate crm"
};

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable} ${jetbrainsMono.variable} dark`}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>" />
      </head>
      <body className="antialiased min-h-screen bg-[#050505] text-[#FFFFFF] font-sans">
        {children}
      </body>
    </html>
  );
}
