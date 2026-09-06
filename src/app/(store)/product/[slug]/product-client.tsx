"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ShoppingBag,
  MessageCircle,
  Minus,
  Plus,
  ChevronRight,
  ShieldCheck,
  Headset,
  PackageCheck,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useHydrated,
  useProducts,
  useSettings,
  addToCart,
} from "@/lib/store";
import {
  buildProductEnquiryMessage,
  discountPercent,
  inr,
  waLink,
} from "@/lib/format";
import { ProductCard } from "@/components/store/product-card";
import { SafeImage } from "@/components/store/safe-image";
import { Stars } from "@/components/store/stars";

export function ProductDetailClient({ slug }: { slug: string }) {
  const params = useParams<{ slug: string }>();
  const activeSlug = (params?.slug as string) ?? slug;
  const hydrated = useHydrated();
  const products = useProducts();
  const settings = useSettings();

  const [imageIdx, setImageIdx] = useState(0);
  const [variant, setVariant] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [resetKey, setResetKey] = useState<string | null>(null);

  const product = useMemo(
    () => products.find((p) => p.slug === activeSlug),
    [products, activeSlug]
  );

  // Reset selections when navigating between products (render-adjust pattern,
  // no effect needed — React re-renders immediately with the fresh state).
  if (hydrated && product && product.id !== resetKey) {
    setResetKey(product.id);
    setImageIdx(0);
    setVariant(product.variants?.options[0] ?? null);
    setQty(1);
  }

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          p.status === "Active" &&
          p.category === product.category
      )
      .slice(0, 4);
  }, [products, product]);

  if (!hydrated) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!product || product.status !== "Active") {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary text-primary">
          <PackageCheck className="h-8 w-8" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold">
          Product not found
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          This product may have been removed or is currently unavailable.
          Browse the shop for more useful finds.
        </p>
        <Button asChild className="mt-6 rounded-full bg-primary hover:bg-plum-soft">
          <Link href="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const discount = discountPercent(product.mrp, product.price);
  const savings = product.mrp - product.price;
  const outOfStock = product.stock <= 0;
  const lineTotal = product.price * qty;
  const waMessage = buildProductEnquiryMessage(
    product.name,
    variant,
    qty,
    lineTotal
  );

  function handleAddToCart() {
    const result = addToCart(product!, qty, variant);
    if (result.ok) {
      toast.success("Added to cart", {
        description: `${product!.name}${variant ? ` (${variant})` : ""} × ${qty}`,
        action: {
          label: "View Cart",
          onClick: () => (window.location.href = "/cart"),
        },
      });
    } else {
      toast.error("Cannot add more", { description: result.reason });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href="/shop" className="hover:text-primary">
          Shop
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-primary"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="font-medium text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
            {product.images[imageIdx] && (
              <SafeImage
                key={product.images[imageIdx]}
                src={product.images[imageIdx]}
                alt={`${product.name} — image ${imageIdx + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            )}
            {discount && (
              <Badge className="absolute left-4 top-4 border-none bg-danger px-3 py-1 text-xs font-bold text-white shadow">
                {discount}% OFF
              </Badge>
            )}
            {product.badge && (
              <Badge className="absolute right-4 top-4 border-none bg-gold px-3 py-1 text-xs font-bold text-white shadow">
                {product.badge}
              </Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3" role="tablist" aria-label="Product images">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  role="tab"
                  aria-selected={imageIdx === i}
                  onClick={() => setImageIdx(i)}
                  className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all sm:h-24 sm:w-24 ${
                    imageIdx === i
                      ? "border-primary shadow-md"
                      : "border-border hover:border-plum-soft"
                  }`}
                >
                  <SafeImage
                    src={img}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-plum-soft">
            {product.category}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold leading-snug text-foreground sm:text-3xl">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Stars rating={product.rating} size="md" />
            <span className="font-medium text-foreground">
              {product.rating}
            </span>
            <span>({product.reviewCount} reviews)</span>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">
              {inr(product.price)}
            </span>
            {discount && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {inr(product.mrp)}
                </span>
                <Badge className="border-none bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                  You save {inr(savings)}
                </Badge>
              </>
            )}
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>

          {/* Variant selector */}
          {product.variants && (
            <div className="mt-6">
              <p className="text-sm font-bold">
                {product.variants.label}
                <span className="ml-2 font-normal text-muted-foreground">
                  {variant}
                </span>
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {product.variants.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setVariant(opt)}
                    className={`min-w-[3rem] rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                      variant === opt
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-input bg-white text-foreground/80 hover:border-plum-soft"
                    }`}
                    aria-pressed={variant === opt}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity stepper (stock-aware) */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-sm font-bold">Quantity</p>
              <div className="mt-2.5 inline-flex items-center rounded-xl border border-input bg-white">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="flex h-11 w-11 items-center justify-center rounded-l-xl text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" aria-hidden />
                </button>
                <span
                  className="w-12 text-center text-base font-bold"
                  aria-live="polite"
                >
                  {qty}
                </span>
                <button
                  onClick={() =>
                    setQty((q) => Math.min(product!.stock, q + 1))
                  }
                  disabled={qty >= product.stock}
                  className="flex h-11 w-11 items-center justify-center rounded-r-xl text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
            <p
              className={`text-sm font-medium ${
                outOfStock
                  ? "text-danger"
                  : product.stock <= 7
                    ? "text-danger"
                    : "text-success"
              }`}
            >
              {outOfStock
                ? "Out of stock"
                : product.stock <= 7
                  ? `Hurry — only ${product.stock} left`
                  : `${product.stock} in stock`}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleAddToCart}
              disabled={outOfStock}
              size="lg"
              className="flex-1 rounded-full bg-primary text-base hover:bg-plum-soft"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden />
              Add to Cart
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              disabled={outOfStock}
              className="flex-1 rounded-full border-[#1e9e4b]/60 bg-[#1e9e4b] text-base text-white hover:bg-[#178a41] hover:text-white"
            >
              <a
                href={outOfStock ? undefined : waLink(settings.whatsapp, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={outOfStock}
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                Order on WhatsApp
              </a>
            </Button>
          </div>

          {/* Support info cards */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: MessageCircle,
                title: "WhatsApp assistance",
                text: "We reply within minutes during store hours.",
              },
              {
                icon: MapPin,
                title: "Local support",
                text: "Walk into our Sutahat store anytime before 10 PM.",
              },
              {
                icon: PackageCheck,
                title: "Live availability",
                text: "Stock shown here is updated by our team daily.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-white p-4"
              >
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                <p className="mt-2.5 text-sm font-bold">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" aria-hidden />
            Genuine products · {settings.orderNote}
          </p>
        </div>
      </div>

      {/* Full description */}
      <section
        aria-labelledby="description"
        className="mt-14 rounded-3xl border border-border bg-white p-6 sm:p-9"
      >
        <h2
          id="description"
          className="font-display text-xl font-bold text-foreground sm:text-2xl"
        >
          About this product
        </h2>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <dl className="mt-7 grid gap-x-10 gap-y-3 text-sm sm:grid-cols-2">
          {[
            ["Category", product.category],
            ["SKU", product.sku],
            ["In stock", `${product.stock} units`],
            ["Rating", `${product.rating} / 5 (${product.reviewCount} reviews)`],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2 border-b border-border/60 pb-2.5">
              <dt className="w-28 shrink-0 font-semibold text-foreground">{k}</dt>
              <dd className="text-muted-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
                Related
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                More from {product.category}
              </h2>
            </div>
            <Link
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex"
            >
              View all <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="h-4" />
      <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <Headset className="h-3.5 w-3.5" aria-hidden />
        Questions? WhatsApp us at {settings.phone} — we are happy to help.
      </p>
    </div>
  );
}