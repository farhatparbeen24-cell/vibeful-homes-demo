"use client";

import Link from "next/link";
import { toast } from "sonner";
import { SafeImage } from "@/components/store/safe-image";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCart,
  useHydrated,
  useSettings,
  removeCartItem,
  updateCartQty,
} from "@/lib/store";
import { cartSubtotal, inr } from "@/lib/format";

export function CartClient() {
  const hydrated = useHydrated();
  const cart = useCart();
  const settings = useSettings();
  const subtotal = cartSubtotal(cart);

  if (!hydrated) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary text-primary">
          <ShoppingBag className="h-10 w-10" aria-hidden />
        </span>
        <h1 className="mt-7 font-display text-2xl font-bold sm:text-3xl">
          Your cart is empty
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          Looks like you have not added anything yet. Explore useful finds for
          the kitchen, storage, utility and décor — your home will thank you.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary px-7 hover:bg-plum-soft"
          >
            <Link href="/shop">
              <ShoppingBag className="h-5 w-5" aria-hidden /> Shop Now
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-[#1e9e4b]/50 text-[#178a41] hover:bg-[#eaf7ef]"
          >
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-5 w-5" aria-hidden /> Ask us for
              suggestions
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Your Cart
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {cart.length} item{cart.length === 1 ? "" : "s"} ·{" "}
        {cart.reduce((s, i) => s + i.qty, 0)} unit
        {cart.reduce((s, i) => s + i.qty, 0) === 1 ? "" : "s"}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        {/* Line items */}
        <ul className="space-y-4">
          {cart.map((item) => (
            <li
              key={`${item.productId}-${item.variant ?? ""}`}
              className="flex gap-4 rounded-2xl border border-border bg-white p-3.5 shadow-sm sm:gap-5 sm:p-4"
            >
              <Link
                href={`/product/${item.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-28"
              >
                {item.image && (
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary sm:text-[15px]"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.variant}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-bold text-primary">
                      {inr(item.price)}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        each
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      removeCartItem(item.productId, item.variant);
                      toast.success("Removed from cart", { description: item.name });
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center rounded-xl border border-input bg-white">
                    <button
                      onClick={() =>
                        updateCartQty(item.productId, item.variant, item.qty - 1)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-l-xl hover:bg-secondary"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" aria-hidden />
                    </button>
                    <span className="w-10 text-center text-sm font-bold">
                      {item.qty}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQty(item.productId, item.variant, item.qty + 1)
                      }
                      disabled={item.qty >= item.maxStock}
                      className="flex h-10 w-10 items-center justify-center rounded-r-xl hover:bg-secondary disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <p className="text-base font-bold">
                    {inr(item.qty * item.price)}
                  </p>
                </div>
                {item.qty >= item.maxStock && item.maxStock > 0 && (
                  <p className="mt-1.5 text-xs font-medium text-danger">
                    Max available stock: {item.maxStock}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold">Order Summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Items</dt>
                <dd className="font-semibold">
                  {cart.reduce((s, i) => s + i.qty, 0)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2.5">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="text-lg font-bold text-primary">
                  {inr(subtotal)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-gold-soft/70 p-3 text-xs leading-relaxed text-foreground/80">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" aria-hidden />
              Final delivery charge will be confirmed on WhatsApp.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-5 w-full rounded-full bg-primary text-base hover:bg-plum-soft"
            >
              <Link href="/checkout">
                Proceed to WhatsApp Checkout
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="mt-3 w-full rounded-full"
            >
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}