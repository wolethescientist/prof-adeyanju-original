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
  { href: "/news", label: "News & Awards" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground hover:text-primary transition-colors"
        >
          I.A. Adeyanju
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
                    "text-sm transition-colors",
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
          className="hidden md:inline-flex font-semibold"
          nativeButton={false}
          render={<a href="#contact" />}
        >
          Contact
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </nav>

      {open && (
        <ul className="md:hidden border-t bg-card px-6 py-3 flex flex-col">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block py-3 text-sm font-medium text-foreground hover:text-primary"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium text-foreground hover:text-primary"
            >
              Contact
            </a>
          </li>
        </ul>
      )}
    </header>
  );
}
