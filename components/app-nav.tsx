"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Dumbbell,
  Layers,
  Languages,
  MessageSquareQuote,
  Mic,
  Settings,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const PRIMARY: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/learn", label: "Lessons", icon: GraduationCap },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/talk", label: "Talk", icon: Mic },
  { href: "/review", label: "Review", icon: Layers },
];

// Desktop sidebar only; the dashboard links to these on mobile, where the bottom bar holds five.
const SECONDARY: NavItem[] = [
  { href: "/challenges", label: "Challenges", icon: Trophy },
  { href: "/phrases", label: "Phrasebook", icon: MessageSquareQuote },
  { href: "/alphabet", label: "Alphabet", icon: Languages },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <aside className="bg-sidebar sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-e px-3 py-5 md:flex">
      <Link
        href="/dashboard"
        className="mb-6 flex items-center gap-2 px-2 font-semibold tracking-tight"
      >
        <span className="bg-primary text-primary-foreground font-arabic grid size-8 place-items-center rounded-lg text-lg leading-none">
          ح
        </span>
        Ustadh
      </Link>
      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1">
        {[...PRIMARY, ...SECONDARY].map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <p className="text-muted-foreground flex items-center gap-2 px-3 text-xs">
        <BookOpen className="size-3.5" aria-hidden />
        Progress is saved in this browser
      </p>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="bg-background/90 fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {PRIMARY.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
