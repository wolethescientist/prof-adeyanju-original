import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Prof. Ibrahim Adepoju Adeyanju — MD/CEO, Galaxy Backbone Limited",
    template: "%s | Prof. Ibrahim Adepoju Adeyanju",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  keywords: [
    "Ibrahim Adeyanju",
    "Ibrahim Adepoju Adeyanju",
    "Prof. Ibrahim Adeyanju",
    "Galaxy Backbone MD",
    "Galaxy Backbone CEO",
    "Galaxy Backbone Limited",
    "Professor of Computer Engineering",
    "artificial intelligence Nigeria",
    "Nigeria digital infrastructure",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NG",
    url: "/",
    title: "Prof. Ibrahim Adepoju Adeyanju",
    description: "Professor of Intelligent Systems · MD/CEO, Galaxy Backbone Limited.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prof. Ibrahim Adepoju Adeyanju",
    description: "Professor of Intelligent Systems · MD/CEO, Galaxy Backbone Limited.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  /* Set GOOGLE_SITE_VERIFICATION to the code Search Console gives for the
     "HTML tag" method; the DNS method needs nothing here. */
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

/* The public site and the CMS have different chrome, so the shared root only
   owns the document itself — each route group brings its own layout. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      /* Smooth scrolling is for in-page links; Next turns it off during route
         changes when told it's there. */
      data-scroll-behavior="smooth"
      className={cn(
        "h-full antialiased",
        publicSans.variable
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
