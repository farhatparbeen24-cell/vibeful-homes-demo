"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  Users,
  Settings,
  Home,
  Search,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useHydrated, useProducts, useSession, logout } from "@/lib/store";
import { ROLE_PERMISSIONS } from "@/lib/types";

const NAV_ITEMS = [
  { key: "dashboard", href: "/admin", label: "Overview", icon: LayoutDashboard },
  { key: "products", href: "/admin/products", label: "Products", icon: Package },
  { key: "inventory", href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { key: "orders", href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { key: "staff", href: "/admin/staff", label: "Staff", icon: Users },
  { key: "settings", href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const session = useSession();
  const products = useProducts();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= 7
  ).length;

  // Route-level auth guard: unauthenticated visits redirect to login.
  useEffect(() => {
    if (hydrated && !session) {
      router.replace("/admin/login");
    }
  }, [hydrated, session, router]);

  // Close the mobile sidebar on navigation (render-adjust pattern).
  const [lastPath, setLastPath] = useState<string | null>(null);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setSidebarOpen(false);
  }

  if (!hydrated || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1ec]">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Checking your session…
          </p>
        </div>
      </div>
    );
  }

  const allowed = ROLE_PERMISSIONS[session.role];

  function handleLogout() {
    logout();
    toast.success("Signed out", { description: "See you soon." });
    router.replace("/admin/login");
  }

  const initials = session.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f1ec]">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-white px-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-secondary"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-display text-base font-bold text-primary">
            Vibeful Admin
          </span>
        </Link>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="relative h-10 w-10"
          aria-label="Low stock alerts"
        >
          <Link href="/admin/inventory">
            <Bell className="h-5 w-5" aria-hidden />
            {lowStockCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                {lowStockCount}
              </span>
            )}
          </Link>
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <button
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-white transition-transform lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Home className="h-4.5 w-4.5" aria-hidden />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-base font-bold text-primary">
                  Vibeful Admin
                </span>
                <span className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {session.role} workspace
                </span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const permitted = allowed.includes(item.key);
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              if (!permitted) {
                return (
                  <button
                    key={item.key}
                    disabled
                    title={`Not available for ${session.role}`}
                    className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground/45"
                  >
                    <Icon className="h-4.5 w-4.5" aria-hidden />
                    {item.label}
                    <ShieldAlert className="ml-auto h-3.5 w-3.5" aria-hidden />
                  </button>
                );
              }
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/75 hover:bg-secondary hover:text-primary"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                  {item.label}
                  {item.key === "inventory" && lowStockCount > 0 && (
                    <Badge
                      className={`ml-auto h-5 min-w-5 px-1.5 text-[10px] font-bold ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-danger text-white"
                      }`}
                    >
                      {lowStockCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border p-3">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground/75 hover:bg-secondary hover:text-primary"
            >
              <ChevronRight className="h-4.5 w-4.5 rotate-180" aria-hidden />
              View storefront
            </Link>
          </div>
        </aside>

        {/* Main column */}
        <div className="min-w-0 flex-1 lg:pl-64">
          {/* Desktop top bar */}
          <header className="sticky top-0 z-30 hidden h-16 items-center gap-4 border-b border-border bg-white/90 px-6 backdrop-blur-md lg:flex">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search orders, products, staff…"
                aria-label="Global search (coming soon)"
                disabled
                className="h-10 w-full cursor-not-allowed rounded-full border border-input bg-cream pl-10 pr-4 text-sm text-muted-foreground/70 placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Badge
                variant="outline"
                className="border-gold/50 bg-gold-soft/70 font-medium text-gold-deep"
              >
                Demo Version
              </Badge>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative h-10 w-10"
                aria-label={`Low stock alerts: ${lowStockCount}`}
              >
                <Link href="/admin/inventory">
                  <Bell className="h-5 w-5" aria-hidden />
                  {lowStockCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                      {lowStockCount}
                    </span>
                  )}
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-secondary"
                    aria-label="Account menu"
                  >
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-left leading-tight sm:block">
                      <span className="block text-sm font-semibold">
                        {session.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {session.role}
                      </span>
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-semibold">{session.name}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                      {session.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-danger focus:text-danger"
                  >
                    <LogOut className="h-4 w-4" aria-hidden />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>

          <footer className="px-6 py-5 text-center text-xs text-muted-foreground">
            Vibeful Homes Admin · Demo Version — data persists locally in
            this browser
          </footer>
        </div>
      </div>
    </div>
  );
}