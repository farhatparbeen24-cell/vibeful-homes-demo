import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SITE_CONFIG, SITE_URL } from "@/lib/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vibeful Homes | Everyday Products for Better Living",
    template: "%s | Vibeful Homes",
  },
  description:
    "Shop useful kitchen, home utility, storage and décor products from Vibeful Homes. Order easily on WhatsApp.",
  applicationName: SITE_CONFIG.businessName,
  keywords: [
    "Vibeful Homes",
    "home goods",
    "kitchen essentials",
    "home organisers",
    "home décor",
    "WhatsApp ordering",
    "Cuttack",
    "Odisha",
  ],
  openGraph: {
    title: "Vibeful Homes | Everyday Products for Better Living",
    description:
      "Shop useful kitchen, home utility, storage and décor products from Vibeful Homes. Order easily on WhatsApp.",
    siteName: SITE_CONFIG.businessName,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Vibeful Homes | Everyday Products for Better Living",
    description:
      "Shop useful kitchen, home utility, storage and décor products from Vibeful Homes. Order easily on WhatsApp.",
  },
};

export const viewport: Viewport = {
  themeColor: "#4B2142",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}