import Footer from "@/app/components/Footer";
import Nav from "@/app/components/Nav";

/** Chrome for the public-facing pages. The CMS at /admin does not use this. */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav />
      <main className="grow">{children}</main>
      <Footer />
    </>
  );
}
