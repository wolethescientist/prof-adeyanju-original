"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  ExternalLink,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  PenLine,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CONTENT_TYPES } from "@/lib/cms/registry";
import { logout } from "../_actions/auth";
import { SECTION_ICONS } from "./section-icons";

type Props = { user: { name: string; email: string; role: string } };

const item =
  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150";
const idle = "text-muted-foreground font-medium hover:bg-accent hover:text-foreground";
const current = "bg-ink text-white font-semibold";

export default function Sidebar({ user }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const groups = [...new Set(CONTENT_TYPES.map((t) => t.group))];

  const link = (href: string, label: string, Icon: typeof Users, exact = true) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(item, active ? current : idle)}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {label}
      </Link>
    );
  };

  const nav = (
    <div className="flex flex-col gap-6">
      <Button
        size="lg"
        className="h-10 justify-start gap-2 rounded-lg font-bold"
        nativeButton={false}
        render={<Link href="/admin/content/news/new" />}
      >
        <PenLine data-icon="inline-start" />
        Post an update
      </Button>

      <div className="flex flex-col gap-0.5">
        {link("/admin", "Dashboard", LayoutDashboard)}
        {link("/admin/media", "Library", FolderOpen)}
        {link("/admin/registrations", "Registrations", ClipboardList)}
      </div>

      {groups.map((group) => (
        <div key={group} className="flex flex-col gap-0.5">
          <p className="px-3 pb-1.5 text-xs font-medium text-muted-foreground/80">
            {group}
          </p>
          {CONTENT_TYPES.filter((t) => t.group === group).map((type) =>
            link(`/admin/content/${type.slug}`, type.label, SECTION_ICONS[type.icon], false)
          )}
        </div>
      ))}

      <div className="flex flex-col gap-0.5">
        <p className="px-3 pb-1.5 text-xs font-medium text-muted-foreground/80">
          Settings
        </p>
        {link("/admin/account", "Your account", UserCircle)}
        {user.role === "admin" && link("/admin/team", "Team", Users)}
      </div>
    </div>
  );

  const footer = (
    <div className="mt-auto pt-6 flex flex-col gap-1 border-t">
      <div className="flex items-center gap-3 px-3 pb-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
          {user.name
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>
      <a href="/" target="_blank" rel="noopener noreferrer" className={cn(item, idle)}>
        <ExternalLink className="size-4" aria-hidden="true" />
        View the website
      </a>
      <form action={logout}>
        <button type="submit" className={cn(item, idle, "w-full cursor-pointer")}>
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </button>
      </form>
    </div>
  );

  const brand = (
    <Link href="/admin" className="block">
      <span className="font-heading text-xl font-semibold tracking-tight">
        I.A. Adeyanju
      </span>
      <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
        Site manager
      </span>
    </Link>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b bg-card px-4 py-3">
        {brand}
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
        <div className="md:hidden border-b bg-card px-4 py-5 flex flex-col min-h-[60vh]">
          {nav}
          {footer}
        </div>
      )}

      {/* Desktop rail */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-card px-4 py-6 h-screen sticky top-0 overflow-y-auto">
        <div className="px-3 mb-6">{brand}</div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
