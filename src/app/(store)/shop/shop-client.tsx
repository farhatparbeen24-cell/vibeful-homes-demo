"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useHydrated, useProducts } from "@/lib/store";
import { CATEGORIES, type Product } from "@/lib/types";
import { ProductCard } from "@/components/store/product-card";

type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

const PRICE_RANGES = [
  { id: "all", label: "All prices", min: 0, max: Infinity },
  { id: "under-300", label: "Under ₹300", min: 0, max: 299 },
  { id: "300-500", label: "₹300 – ₹500", min: 300, max: 500 },
  { id: "500-800", label: "₹500 – ₹800", min: 500, max: 800 },
  { id: "above-800", label: "Above ₹800", min: 801, max: Infinity },
] as const;

export function ShopClient() {
  const hydrated = useHydrated();
  const products = useProducts();
  const params = useSearchParams();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [syncedParamsKey, setSyncedParamsKey] = useState<string | null>(null);

  // Support ?category= and ?q= and ?badge= query params (deep links).
  // Render-adjust pattern: sync once whenever the URL actually changes.
  const paramsKey = hydrated ? params.toString() : null;
  if (paramsKey !== null && paramsKey !== syncedParamsKey) {
    setSyncedParamsKey(paramsKey);
    const cat = params.get("category");
    if (cat && CATEGORIES.includes(cat as (typeof CATEGORIES)[number])) {
      setCategory(cat);
    }
    const q = params.get("q");
    if (q) setQuery(q);
    const badge = params.get("badge");
    if (badge) setQuery(badge);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const range = PRICE_RANGES.find((r) => r.id === priceRange) ?? PRICE_RANGES[0];
    let list = products.filter((p) => p.status === "Active");
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          (p.badge ?? "").toLowerCase().includes(q)
      );
    }
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (priceRange !== "all") {
      list = list.filter((p) => p.price >= range.min && p.price <= range.max);
    }
    if (inStockOnly) list = list.filter((p) => p.stock > 0);
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list = [...list].sort(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
        );
        break;
      default:
        list = [...list].sort(featuredFirst);
    }
    return list;
  }, [products, query, category, priceRange, inStockOnly, sort]);

  const hasActiveFilters =
    query.trim() !== "" ||
    category !== "all" ||
    priceRange !== "all" ||
    inStockOnly;

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setPriceRange("all");
    setInStockOnly(false);
  }

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-foreground">Category</h3>
        <div className="mt-3 space-y-2">
          {["all", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`block w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                category === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/70 text-foreground/80 hover:bg-secondary"
              }`}
            >
              {c === "all" ? "All categories" : c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-foreground">Price range</h3>
        <div className="mt-3 space-y-2">
          {PRICE_RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setPriceRange(r.id)}
              className={`block w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                priceRange === r.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/70 text-foreground/80 hover:bg-secondary"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-foreground">Availability</h3>
        <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl bg-secondary/70 px-3.5 py-2.5">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(v) => setInStockOnly(v === true)}
            aria-label="Show in-stock products only"
          />
          <span className="text-sm font-medium">In stock only</span>
        </label>
      </div>
      {hasActiveFilters && (
        <Button
          onClick={clearFilters}
          variant="outline"
          className="w-full rounded-xl"
        >
          <X className="h-4 w-4" aria-hidden /> Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Page heading */}
      <div className="max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
          The full collection
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Shop useful finds for every corner of home.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Kitchen tools, utility essentials, smart organisers and warm décor —
          every item tested for daily Indian homes, with easy WhatsApp
          ordering.
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories, badges…"
            aria-label="Search products"
            className="h-11 rounded-full border-input bg-white pl-10 pr-4"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger
            aria-label="Sort products"
            className="h-11 w-[10.5rem] rounded-full bg-white"
          >
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
        {/* Mobile filter sheet */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="h-11 rounded-full bg-white lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Filters
              {hasActiveFilters && (
                <Badge className="ml-1 h-2 w-2 rounded-full bg-gold p-0" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[19rem] overflow-y-auto p-6">
            <SheetHeader className="px-0">
              <SheetTitle className="text-left">Filters</SheetTitle>
            </SheetHeader>
            {filterPanel}
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[15rem_1fr]">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block" aria-label="Product filters">
          {filterPanel}
        </aside>

        {/* Results */}
        <div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {hydrated
              ? `${filtered.length} product${filtered.length === 1 ? "" : "s"}`
              : "Loading…"}
          </p>
          {hydrated && filtered.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                <PackageSearch className="h-7 w-7" aria-hidden />
              </span>
              <h2 className="mt-5 font-display text-xl font-bold">
                No products found
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Try a different search or remove a filter — our shelves change
                as new stock arrives.
              </p>
              <Button
                onClick={clearFilters}
                className="mt-6 rounded-full bg-primary hover:bg-plum-soft"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {hydrated
                ? filtered.map((p) => <ProductCard key={p.id} product={p} />)
                : Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-2xl border border-border bg-white"
                    >
                      <Skeleton className="aspect-square rounded-none" />
                      <div className="space-y-2.5 p-4">
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-5 w-1/3" />
                      </div>
                    </div>
                  ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function featuredFirst(a: Product, b: Product): number {
  const badgeRank = (p: Product) => {
    switch (p.badge) {
      case "Best Seller":
        return 0;
      case "Popular":
        return 1;
      case "New Arrival":
        return 2;
      case "Low Stock":
        return 3;
      default:
        return 4;
    }
  };
  const diff = badgeRank(a) - badgeRank(b);
  if (diff !== 0) return diff;
  return b.rating - a.rating;
}