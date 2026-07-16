import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import "./globals.css";
import { cn } from "@/lib/utils";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Prof. Ibrahim Adepoju Adeyanju — MD/CEO, Galaxy Backbone Limited",
  description:
    "Professor of Computer Engineering, AI researcher and Managing Director/CEO of Galaxy Backbone Limited — leading Nigeria's federal digital infrastructure.",
  openGraph: {
    title: "Prof. Ibrahim Adepoju Adeyanju",
    description:
      "Professor of Intelligent Systems · MD/CEO, Galaxy Backbone Limited.",
    images: ["/images/portrait-md.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", quicksand.variable)}>
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
