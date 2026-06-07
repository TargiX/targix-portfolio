import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/posthog-provider";
import { SITE, absoluteUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: SITE.title,
    template: "%s — Ilya Moskovkin",
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
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#101114" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('portfolio-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}else{document.documentElement.removeAttribute('data-theme')}}catch(e){}`,
          }}
        />
        <PostHogProvider>
          <div className="body-dots" aria-hidden="true" />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
