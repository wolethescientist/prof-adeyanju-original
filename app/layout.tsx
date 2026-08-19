import type { Metadata } from "next";
import { Public_Sans, Space_Grotesk } from "next/font/google";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import "./globals.css";
import { cn } from "@/lib/utils";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prof-adeyanju.vercel.app"),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", publicSans.variable, spaceGrotesk.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
