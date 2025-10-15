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
  title: "DesignForge AI - Professional 3D Icon & Logo Generator",
  description: "Professional AI-powered 3D icon and logo generator with batch generation, guided prompt builder, advanced editing tools, and vector export. Create stunning designs with multiple variations.",
  keywords: ["3D icons", "AI logo generator", "batch generation", "vector export", "professional design", "AI art", "logo design", "icon generator"],
  authors: [{ name: "DesignForge AI" }],
  openGraph: {
    title: "DesignForge AI - Professional Design Studio",
    description: "Professional AI design tools with batch generation and advanced editing",
    url: "https://chat.z.ai",
    siteName: "DesignForge AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DesignForge AI - Professional Design Studio",
    description: "Professional AI design tools with batch generation and advanced editing",
  },
};

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
