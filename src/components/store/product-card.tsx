"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { discountPercent, inr } from "@/lib/format";
import { addToCart } from "@/lib/store";
import { SafeImage } from "./safe-image";
import { Stars } from "./stars";

const BADGE_STYLES: Record<string, string> = {
  "Best Seller": "bg-gold text-white",
  Popular: "bg-primary text-primary-foreground",
  "New Arrival": "bg-success text-white",
  "Low Stock": "bg-danger text-white",
};

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product.mrp, product.price);
  const outOfStock = product.stock <= 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    const result = addToCart(product, 1, null);
    if (result.ok) {
      toast.success("Added to cart", {
        description: product.name,
      });
    } else {
      toast.error("Cannot add more", { description: result.reason });
    }
  }

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_3px_rgba(30,27,29,0.05)] transition-shadow hover:shadow-[0_10px_28px_rgba(75,33,66,0.12)]">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-muted"
        aria-label={product.name}
      >
        {product.images[0] && (
          <SafeImage
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="img-zoom object-cover"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && (
            <Badge
              className={`border-none px-2.5 py-1 text-[11px] font-bold shadow-sm ${
                BADGE_STYLES[product.badge] ?? "bg-secondary text-primary"
              }`}
            >
              {product.badge}
            </Badge>
          )}
          {discount && (
            <Badge className="border-none bg-danger px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              {discount}% OFF
            </Badge>
          )}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-foreground/85 px-4 py-1.5 text-xs font-semibold text-white">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-plum-soft">
          {product.category}
        </p>
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Stars rating={product.rating} size="sm" />
          <span>
            {product.rating} ({product.reviewCount})
          </span>
        </div>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            {inr(product.price)}
          </span>
          {discount && (
            <span className="text-sm text-muted-foreground line-through">
              {inr(product.mrp)}
            </span>
          )}
        </div>
        <p
          className={`text-xs font-medium ${
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
              ? `Only ${product.stock} left`
              : "In stock"}
        </p>
        <Button
          onClick={handleAdd}
          disabled={outOfStock}
          className="mt-2 w-full rounded-xl bg-primary text-primary-foreground hover:bg-plum-soft"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingBag className="h-4 w-4" aria-hidden />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

/** Small toast helper reused by pages. */
export function notifyAdded(name: string) {
  toast.success("Added to cart", {
    description: name,
    action: { label: "View Cart", onClick: () => (window.location.href = "/cart") },
  });
}

export function WhatsAppTick() {
  return <Check className="h-4 w-4" aria-hidden />;
}