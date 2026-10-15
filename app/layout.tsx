import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eleganzabymittali.com"),

  title: "Eleganza by Mittali | Elegant Indian Fashion",
  description:
    "Discover elegant Indian fashion by Eleganza by Mittali — curated Farshi Sets, Cord Sets, Suits and timeless ethnic wear.",
  keywords: [
    "Eleganza by Mittali",
    "Farshi Sets",
    "Cord Sets",
    "Suits",
    "Indian Fashion",
    "Ethnic Wear",
  ],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Eleganza by Mittali | Elegant Indian Fashion",
    description:
      "Discover elegant Indian fashion by Eleganza by Mittali — curated Farshi Sets, Cord Sets, Suits and timeless ethnic wear.",
    type: "website",
    siteName: "Eleganza by Mittali",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
