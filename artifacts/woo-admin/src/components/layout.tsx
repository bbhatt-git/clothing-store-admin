import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Star,
  Ticket,
  Hash,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/tags", label: "Tags", icon: Hash },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/coupons", label: "Coupons", icon: Ticket },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !user && location !== "/login") {
      setLocation("/login");
    }
  }, [user, isLoading, location, mounted, setLocation]);

  useEffect(() => {
    if (mounted && !isLoading && user && location === "/login") {
      setLocation("/");
    }
  }, [user, isLoading, location, mounted, setLocation]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  if (location === "/login") {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const Sidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-primary rounded-sm flex items-center justify-center shrink-0">
            <span className="text-xs font-black text-primary-foreground">SZ</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tighter text-foreground uppercase">
              StyleZone
            </h1>
            <p className="text-[10px] text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer group relative ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ring-1 ring-primary/30">
              <span className="text-xs font-bold text-primary uppercase">
                {user.username.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-sm font-medium truncate text-foreground block">
                {user.username}
              </span>
              <span className="text-[10px] text-muted-foreground">Administrator</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-sm"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0">
        <Sidebar />
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              key="sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col"
            >
              <Sidebar isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={sidebarOpen ? "close" : "open"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </AnimatePresence>
          </Button>
          <span className="font-bold tracking-tighter text-sm uppercase">StyleZone</span>
        </div>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
