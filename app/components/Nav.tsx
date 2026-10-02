"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/about", label: "About" },
  { href: "/journey", label: "Journey" },
  { href: "/impact", label: "Impact" },
  { href: "/research", label: "Research" },
  { href: "/recognition", label: "Recognition" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed top-4 left-4 right-4 z-50 flex justify-center">
      <div
        className="fixed top-0 left-0 right-0 h-[3px] bg-primary origin-left z-50"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />
      <nav
        className={cn(
          "w-full max-w-5xl rounded-full bg-card/90 backdrop-blur-md border px-6 py-3 flex items-center justify-between transition-shadow duration-300",
          scrolled
            ? "shadow-[0_10px_35px_rgba(16,24,40,0.1)]"
            : "shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
        )}
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="font-heading font-semibold text-xl tracking-tight text-foreground hover:text-primary transition-colors duration-200"
        >
          I.A. Adeyanju<span className="text-primary">.</span>
        </Link>

        <ul className="hidden md:flex items-center gap-7">
          {links.map((l) => {
            /* An article page lights up the section it belongs to. */
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm transition-colors duration-200",
                    active
                      ? "text-primary font-semibold"
                      : "text-muted-foreground font-medium hover:text-primary"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Button
          className="hidden md:inline-flex rounded-full px-5 font-semibold"
          nativeButton={false}
          render={<a href="#contact" />}
        >
          Contact
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </Button>

        {open && (
          <ul className="absolute top-full left-0 right-0 mt-3 md:hidden rounded-3xl border bg-card p-4 flex flex-col gap-1 shadow-xl">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                Contact
              </a>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
