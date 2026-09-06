"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  Phone,
  MapPin,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { SafeImage } from "@/components/store/safe-image";
import {
  useCart,
  useHydrated,
  useSettings,
  clearCart,
  createOrder,
} from "@/lib/store";
import {
  buildOrderMessage,
  cartSubtotal,
  inr,
  isValidIndianMobile,
  isValidPincode,
  waLink,
} from "@/lib/format";
import type { Order } from "@/lib/types";

interface FormState {
  name: string;
  mobile: string;
  address: string;
  city: string;
  pincode: string;
  note: string;
  acknowledged: boolean;
}

const EMPTY: FormState = {
  name: "",
  mobile: "",
  address: "",
  city: "",
  pincode: "",
  note: "",
  acknowledged: false,
};

export function CheckoutClient() {
  const hydrated = useHydrated();
  const cart = useCart();
  const settings = useSettings();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [waHref, setWaHref] = useState<string>("");

  const subtotal = cartSubtotal(cart);

  const set = (key: keyof FormState, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 3) {
      next.name = "Please enter your full name (at least 3 characters).";
    }
    if (!isValidIndianMobile(form.mobile)) {
      next.mobile =
        "Enter a valid 10-digit Indian mobile number (starting 6–9).";
    }
    if (form.address.trim().length < 10) {
      next.address = "Please enter your complete delivery address.";
    }
    if (form.city.trim().length < 2) {
      next.city = "Please enter your city or town.";
    }
    if (!isValidPincode(form.pincode)) {
      next.pincode = "Enter a valid 6-digit pincode.";
    }
    if (!form.acknowledged) {
      next.acknowledged =
        "Please confirm to continue — availability and delivery charges are confirmed on WhatsApp.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please check the highlighted fields", {
        description: "A few details need a correction before sending.",
      });
      return false;
    }
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!validate()) return;

    // 1. Create the order record (localStorage) with a unique ID.
    //    NOTE: stock is intentionally NOT reduced at checkout — see lib/store.ts.
    const order = createOrder(
      {
        name: form.name.trim(),
        mobile: form.mobile.replace(/[\s-]/g, ""),
        address: form.address.trim(),
        city: form.city.trim(),
        pincode: form.pincode.trim(),
        note: form.note.trim(),
      },
      cart,
      subtotal
    );

    // 2. Build the URL-encoded WhatsApp message and open wa.me in a new tab.
    const message = buildOrderMessage(order);
    const href = waLink(settings.whatsapp, message);
    setWaHref(href);
    window.open(href, "_blank", "noopener,noreferrer");

    // 3. Clear cart & show the success screen.
    clearCart();
    setPlacedOrder(order);
    toast.success("Order placed", {
      description: `${order.id} — now tap Send inside WhatsApp.`,
    });
  }

  const itemsCount = cart.reduce((s, i) => s + i.qty, 0);

  // ---------------- Success screen ----------------
  if (placedOrder) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-11 w-11 text-success" aria-hidden />
        </span>
        <h1 className="mt-7 font-display text-3xl font-bold">
          Order ready on WhatsApp
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          We have prepared your order message.{" "}
          <span className="font-semibold text-foreground">
            Tap the Send button inside WhatsApp
          </span>{" "}
          so it reaches the store — availability and delivery details are
          confirmed there.
        </p>
        <div className="mt-7 w-full rounded-3xl border border-border bg-white p-6 text-left shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Order ID
            </span>
            <span className="font-mono text-base font-bold text-primary">
              {placedOrder.id}
            </span>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{placedOrder.customer.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Items</dt>
              <dd className="font-medium">
                {placedOrder.items.length} product
                {placedOrder.items.length === 1 ? "" : "s"} ·{" "}
                {placedOrder.items.reduce((s, i) => s + i.qty, 0)} units
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="text-base font-bold text-primary">
                {inr(placedOrder.subtotal)}
              </dd>
            </div>
          </dl>
        </div>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-[#1e9e4b] px-8 text-base hover:bg-[#178a41]"
          >
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" aria-hidden /> Open WhatsApp
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full px-8"
          >
            <Link href="/shop">
              <ShoppingBag className="h-5 w-5" aria-hidden /> Continue Shopping
            </Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Did not leave this page? Tap “Open WhatsApp” above and press Send in
          the chat.
        </p>
      </div>
    );
  }

  // ---------------- Loading ----------------
  if (!hydrated) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_22rem]">
        <Skeleton className="h-[28rem] w-full rounded-3xl" />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
    );
  }

  // ---------------- Empty cart ----------------
  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary text-primary">
          <ShoppingBag className="h-10 w-10" aria-hidden />
        </span>
        <h1 className="mt-7 font-display text-2xl font-bold sm:text-3xl">
          Nothing to check out yet
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Add a few useful finds to your cart first — then come back to send
          the order on WhatsApp.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 rounded-full bg-primary px-7 hover:bg-plum-soft"
        >
          <Link href="/shop">
            <ShoppingBag className="h-5 w-5" aria-hidden /> Shop Now
          </Link>
        </Button>
      </div>
    );
  }

  // ---------------- Checkout form ----------------
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
          WhatsApp checkout
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-foreground">
          Where should we deliver?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Fill your details once — your order becomes a ready-made WhatsApp
          message to the store. Availability and delivery charges are
          confirmed in the chat before dispatch.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]"
      >
        {/* Form (left on desktop) */}
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <User className="h-4.5 w-4.5 text-primary" aria-hidden />
            Delivery details
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Full name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Priya Sharma"
                autoComplete="name"
                aria-invalid={!!errors.name}
                className={
                  errors.name
                    ? "border-danger focus-visible:ring-danger/40"
                    : ""
                }
              />
              {errors.name && <FieldError message={errors.name} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile number *</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="mobile"
                  value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value.replace(/[^\d\s-]/g, ""))}
                  placeholder="10-digit number"
                  inputMode="numeric"
                  autoComplete="tel"
                  aria-invalid={!!errors.mobile}
                  className={`pl-10 ${
                    errors.mobile
                      ? "border-danger focus-visible:ring-danger/40"
                      : ""
                  }`}
                />
              </div>
              {errors.mobile && <FieldError message={errors.mobile} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City / Town *</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Cuttack"
                autoComplete="address-level2"
                aria-invalid={!!errors.city}
                className={
                  errors.city ? "border-danger focus-visible:ring-danger/40" : ""
                }
              />
              {errors.city && <FieldError message={errors.city} />}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Full delivery address *</Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="House / flat no., street, landmark, area"
                  rows={3}
                  autoComplete="street-address"
                  aria-invalid={!!errors.address}
                  className={`resize-none pl-10 ${
                    errors.address
                      ? "border-danger focus-visible:ring-danger/40"
                      : ""
                  }`}
                />
              </div>
              {errors.address && <FieldError message={errors.address} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={form.pincode}
                onChange={(e) =>
                  set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="6-digit pincode"
                inputMode="numeric"
                autoComplete="postal-code"
                aria-invalid={!!errors.pincode}
                className={
                  errors.pincode
                    ? "border-danger focus-visible:ring-danger/40"
                    : ""
                }
              />
              {errors.pincode && <FieldError message={errors.pincode} />}
            </div>

            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="note">
                Order note{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <div className="relative">
                <NotebookPen className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="note"
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="Delivery time, gift note, special request…"
                  rows={2}
                  className="resize-none pl-10"
                />
              </div>
            </div>
          </div>

          <label
            className={`mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
              errors.acknowledged
                ? "border-danger bg-danger/5"
                : "border-border bg-cream"
            }`}
          >
            <Checkbox
              checked={form.acknowledged}
              onCheckedChange={(v) => set("acknowledged", v === true)}
              aria-label="Confirm WhatsApp confirmation process"
              className="mt-0.5"
            />
            <span className="text-sm leading-relaxed text-foreground/85">
              I understand that availability and delivery charges will be
              confirmed on WhatsApp.
            </span>
          </label>
          {errors.acknowledged && (
            <FieldError message={errors.acknowledged} />
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full rounded-full bg-[#1e9e4b] text-base hover:bg-[#178a41] sm:hidden"
          >
            <MessageCircle className="h-5 w-5" aria-hidden /> Send Order on
            WhatsApp
          </Button>
        </div>

        {/* Order summary (right on desktop) */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold">Order Summary</h2>
            <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto scrollbar-thin pr-1">
              {cart.map((item) => (
                <li
                  key={`${item.productId}-${item.variant ?? ""}`}
                  className="flex gap-3"
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.image && (
                      <SafeImage
                        src={item.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm font-medium">
                      {item.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.qty} × {inr(item.price)}
                      {item.variant ? ` · ${item.variant}` : ""}
                    </span>
                  </span>
                  <span className="text-sm font-bold">
                    {inr(item.qty * item.price)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2.5 border-t border-border/60 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Items ({itemsCount})
                </dt>
                <dd className="font-semibold">{inr(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="font-medium text-muted-foreground">
                  On WhatsApp
                </dd>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2.5">
                <dt className="font-bold">Subtotal</dt>
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
              type="submit"
              size="lg"
              className="mt-5 hidden w-full rounded-full bg-[#1e9e4b] text-base hover:bg-[#178a41] sm:flex"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              Send Order on WhatsApp
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden />
              No payment is collected online — pay on confirmation.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-xs font-medium text-danger" role="alert">
      {message}
    </p>
  );
}