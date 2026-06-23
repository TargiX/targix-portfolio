import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/posthog-provider";
import { SITE, absoluteUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
});

export const metadata: Metadata = {
  title: {
    default: SITE.title,
    template: "%s · Ilya Moskovkin",
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  alternates: {
    canonical: "/",
  },
  keywords: [...SITE.keywords],
  creator: SITE.author,
  publisher: SITE.author,
  authors: [{ name: SITE.author, url: SITE.url }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: SITE.locale,
    type: "website",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: SITE.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [absoluteUrl("/opengraph-image")],
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#15171d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `try{localStorage.removeItem('portfolio-theme');document.documentElement.dataset.theme='dark'}catch(e){document.documentElement.dataset.theme='dark'}`,
          }}
        />
      </head>
      <body className="min-h-full overflow-x-hidden">
        <PostHogProvider>
          <div className="body-dots" aria-hidden="true" />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
