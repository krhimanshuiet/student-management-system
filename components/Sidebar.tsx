"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  BookOpen,
  BarChart3,
  FileText,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/students", label: "Students", icon: GraduationCap },
  { href: "/dashboard/companies", label: "Companies", icon: Building2 },
  { href: "/dashboard/training", label: "Training", icon: BookOpen },
  { href: "/dashboard/results", label: "Results", icon: BarChart3 },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r flex flex-col min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">Student MS</p>
            <p className="text-xs text-muted-foreground">SIT Aurangabad</p>
          </div>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 p-3 space-y-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const active =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
