"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  ShoppingBag,
  Sparkles,
  X,
  Menu,
  Phone,
} from "lucide-react";
import { SafeImage } from "@/components/store/safe-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart, useHydrated, useProducts, useSettings } from "@/lib/store";
import { cartCount } from "@/lib/format";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop?badge=Best%20Seller", label: "Best Sellers" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const cart = useCart();
  const hydrated = useHydrated();
  const products = useProducts();
  const settings = useSettings();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const count = hydrated ? cartCount(cart) : 0;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.status === "Active" &&
          (p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [query, products]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setMobileMenuOpen(false);
  }

  const waHref = `https://wa.me/${settings.whatsapp}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-md">
      {/* Top strip */}
      <div className="hidden bg-primary text-primary-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-1.5 text-xs">
          <p className="font-medium tracking-wide">
            Everyday Products for Better Living
          </p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Open · Closes 10 PM
            </span>
            <a
              href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}
              className="flex items-center gap-1.5 font-medium hover:underline"
            >
              <Phone className="h-3 w-3" /> {settings.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center gap-3 sm:h-[4.5rem] sm:gap-5">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Home className="h-5 w-5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold tracking-tight text-primary sm:text-xl">
                Vibeful Homes
              </span>
              <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:block">
                Home · Kitchen · Décor
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => {
              const base = item.href.split("?")[0];
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : base === "/shop"
                    ? pathname === "/shop" && !item.href.includes("?")
                    : pathname.startsWith(base);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-secondary text-primary"
                      : "text-foreground/80 hover:bg-secondary/70 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search (desktop) */}
          <div className="relative ml-auto hidden max-w-xs flex-1 md:block">
            <form onSubmit={submitSearch} role="search">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(e.target.value.trim().length > 0);
                }}
                onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                placeholder="Search products…"
                aria-label="Search products"
                className="h-10 rounded-full border-input bg-white pl-10 pr-4 text-sm shadow-none"
              />
            </form>
            {searchOpen && results.length > 0 && (
              <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="flex items-center gap-3 border-b border-border/60 p-3 last:border-0 hover:bg-accent/60"
                    onClick={() => setSearchOpen(false)}
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <SafeImage
                        src={p.images[0]}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {p.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {p.category}
                      </span>
                    </span>
                  </Link>
                ))}
                <button
                  type="submit"
                  form="header-search-form"
                  className="block w-full bg-secondary/60 p-2.5 text-center text-xs font-semibold text-primary hover:bg-secondary"
                >
                  View all results
                </button>
              </div>
            )}
          </div>

          {/* Cart + WhatsApp CTA */}
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Link
              href="/cart"
              aria-label={`Cart, ${count} items`}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-white shadow">
                  {count}
                </Badge>
              )}
            </Link>
            <Button
              asChild
              className="hidden rounded-full bg-[#1e9e4b] px-5 shadow-sm hover:bg-[#178a41] sm:inline-flex"
            >
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Order on WhatsApp
              </a>
            </Button>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary lg:hidden"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 pt-3 lg:hidden">
          <form onSubmit={submitSearch} role="search" className="mb-3 md:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                className="h-11 rounded-full border-input bg-white pl-10 pr-4"
              />
            </div>
          </form>
          <nav className="grid gap-1" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-foreground/90 hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#1e9e4b] px-4 py-3 text-sm font-semibold text-white"
            >
              <Sparkles className="h-4 w-4" aria-hidden /> Order on WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}