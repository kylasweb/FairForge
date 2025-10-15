import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FairForge - Professional 3D Icon & Logo Generator",
  description: "Create stunning 3D icons, logos, and UI designs with AI-powered tools. Professional design studio for modern creators.",
  keywords: "AI design, 3D icons, logo generator, UI design, graphic design, brand identity",
  authors: [{ name: "FairForge" }],
  openGraph: {
    title: "FairForge - Professional Design Studio",
    description: "Create stunning 3D icons, logos, and UI designs with AI-powered tools.",
    type: "website",
    siteName: "FairForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "FairForge - Professional Design Studio",
    description: "Create stunning 3D icons, logos, and UI designs with AI-powered tools.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
