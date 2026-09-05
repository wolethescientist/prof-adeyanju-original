"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CONTENT_TYPES } from "@/lib/cms/registry";
import { logout } from "../_actions/auth";

type Props = { user: { name: string; email: string; role: string } };

export default function Sidebar({ user }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const groups = [...new Set(CONTENT_TYPES.map((t) => t.group))];

  const link = (href: string, label: string, Icon: typeof Users) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setOpen(false)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
          active
            ? "bg-secondary text-secondary-foreground font-semibold"
            : "text-muted-foreground font-medium hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {label}
      </Link>
    );
  };

  const nav = (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        {link("/admin", "Dashboard", LayoutDashboard)}
        {link("/admin/media", "Images", ImageIcon)}
        {link("/admin/account", "Your account", UserCircle)}
        {user.role === "admin" && link("/admin/team", "Team", Users)}
      </div>

      {groups.map((group) => (
        <div key={group} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
            {group}
          </p>
          {CONTENT_TYPES.filter((t) => t.group === group).map((type) => {
            const href = `/admin/content/${type.slug}`;
            const active = pathname.startsWith(href);
            return (
              <Link
                key={type.slug}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors duration-150",
                  active
                    ? "bg-secondary text-secondary-foreground font-semibold"
                    : "text-muted-foreground font-medium hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {type.label}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );

  const footer = (
    <div className="mt-auto pt-6 flex flex-col gap-3 border-t">
      <div className="px-3">
        <p className="text-sm font-semibold truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
      >
        <ExternalLink className="size-4" aria-hidden="true" />
        View the website
      </a>
      <form action={logout}>
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150 cursor-pointer"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b bg-card px-4 py-3">
        <Link href="/admin" className="font-heading font-bold">
          Site manager
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <div className="md:hidden border-b bg-card px-4 py-4 flex flex-col min-h-[60vh]">
          {nav}
          {footer}
        </div>
      )}

      {/* Desktop rail */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-card px-4 py-6 h-screen sticky top-0 overflow-y-auto">
        <Link href="/admin" className="px-3 mb-7 font-heading text-base font-bold">
          I.A. Adeyanju<span className="text-primary">.</span>
          <span className="block text-xs font-medium text-muted-foreground mt-0.5">
            Site manager
          </span>
        </Link>
        {nav}
        {footer}
      </aside>
    </>
  );
}
