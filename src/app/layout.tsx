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
  title: "Ilya Moskovkin — Portfolio",
  description:
    "Senior frontend engineer with fullstack chops and UI/UX roots. Building products, not pages.",
  metadataBase: new URL("https://ilyamoskovkin.com"),
  openGraph: {
    title: "Ilya Moskovkin — Portfolio",
    description: "Senior frontend engineer · UI/UX roots · building products.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <div className="body-dots" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
