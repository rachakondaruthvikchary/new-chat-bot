"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ConvergeMark from "@/components/ConvergeMark";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "@/components/SignOutButton";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/profile", label: "Profile", icon: "👤" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <ConvergeMark size={32} animate={false} />
        <span className="font-display text-lg font-semibold">Converge</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-background hover:text-foreground"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-medium text-white">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
        </div>
        <ThemeToggle />
        <SignOutButton />
      </div>
    </aside>
  );
}
