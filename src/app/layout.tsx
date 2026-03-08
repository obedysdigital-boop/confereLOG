import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F5132",
};

export const metadata: Metadata = {
  title: "ConfereLOG - Sistema de Validação de Fretes",
  description: "Sistema de validação de fretes para conferência e identificação de divergências. Grupo Doce Mel.",
  keywords: ["fretes", "logística", "validação", "Grupo Doce Mel", "Conferência"],
  authors: [{ name: "Grupo Doce Mel" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "ConfereLOG",
    description: "Sistema de Validação de Fretes - Grupo Doce Mel",
    type: "website",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
