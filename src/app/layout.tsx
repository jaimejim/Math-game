import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Math Race! - A Math Game for Kids",
  description: "A fun two-player math race game for kids on iPad",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e1b4b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Math Race!" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className={`${geistMono.variable} antialiased`}>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
