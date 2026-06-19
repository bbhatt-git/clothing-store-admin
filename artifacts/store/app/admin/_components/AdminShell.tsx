"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "../_lib/auth-context";
import {
  LayoutDashboard, Package, ShoppingCart, Tag, MessageSquare, Ticket, LogOut, Layers, ChevronRight
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#0f0f11] flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-[#18181b] border-r border-white/5 flex flex-col">
        <div className="px-5 py-5 border-b border-white/5">
          <div className="text-sm font-bold tracking-widest text-orange-500 uppercase">StyleZone</div>
          <div className="text-xs text-white/30 mt-0.5">Admin Dashboard</div>
        </div>
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${active ? "bg-orange-500/15 text-orange-400 font-medium" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {active && <ChevronRight className="h-3 w-3 ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/5">
          <div className="text-xs text-white/30 mb-2 truncate">{user.username}</div>
          <button onClick={() => { logout(); router.push("/admin/login"); }}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-red-400 transition-colors w-full">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto text-white">
          {children}
        </div>
      </main>
    </div>
  );
}
