import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Public_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

/* Headlines and article text: an editorial serif, for a site that is mostly
   citations, honours and stories. Optical sizing keeps it crisp at 14px and
   graceful at 72px. */
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

/* Dates, years and labels — the record-keeping voice. */
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://prof-adeyanju.vercel.app"
  ),
  title: "Prof. Ibrahim Adepoju Adeyanju — MD/CEO, Galaxy Backbone Limited",
  description:
    "Professor of Computer Engineering, AI researcher and Managing Director/CEO of Galaxy Backbone Limited — leading Nigeria's federal digital infrastructure.",
  openGraph: {
    title: "Prof. Ibrahim Adepoju Adeyanju",
    description:
      "Professor of Intelligent Systems · MD/CEO, Galaxy Backbone Limited.",
    images: ["/images/adeyanju-portrait.jpg"],
  },
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
        publicSans.variable,
        newsreader.variable,
        plexMono.variable
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
