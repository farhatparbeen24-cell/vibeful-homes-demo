"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  MessageCircle,
  Phone,
  MapPin,
  BadgeCheck,
  Headset,
  Wallet,
  Compass,
  Search,
  ShoppingBag,
  ArrowRight,
  Star,
  PackageSearch,
  Home,
  HandHeart,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated, useProducts, useSettings } from "@/lib/store";
import { mapsLink, telLink, waLink } from "@/lib/format";
import { CATEGORIES, type Product } from "@/lib/types";
import { CATEGORY_IMAGES } from "@/lib/seed";
import { ProductCard } from "@/components/store/product-card";
import { Stars } from "@/components/store/stars";

// ---------------------------------------------------------------------------
// Homepage — sections A–I per the build spec.
// ---------------------------------------------------------------------------

export function HomePage() {
  const hydrated = useHydrated();
  const products = useProducts();
  const settings = useSettings();

  const active = products.filter((p) => p.status === "Active");

  const bestSellers = pickBestSellers(active);
  const newArrivals = pickNewArrivals(active);

  return (
    <div className="bg-background">
      {/* A. Hero ------------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-gold-soft/70 via-background to-secondary/50"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/70 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Smart finds for modern homes
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.12] text-foreground sm:text-5xl lg:text-6xl">
              Little upgrades.{" "}
              <span className="italic text-primary">
                A more beautiful everyday.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Thoughtfully selected kitchen, utility, storage and décor
              essentials — delivered with friendly local support.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-primary px-7 text-base shadow-md hover:bg-plum-soft"
              >
                <Link href="/shop">
                  <ShoppingBag className="h-5 w-5" aria-hidden />
                  Shop Products
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-[#1e9e4b]/60 bg-[#1e9e4b] px-7 text-base text-white shadow-sm hover:bg-[#178a41] hover:text-white"
              >
                <a
                  href={waLink(
                    settings.whatsapp,
                    "Hello Vibeful Homes, I would like to place an order."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  Order on WhatsApp
                </a>
              </Button>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-foreground/80">
              {[
                { icon: BadgeCheck, label: "Genuine products" },
                { icon: Headset, label: "Quick WhatsApp support" },
                { icon: Wallet, label: "Value prices" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="h-4.5 w-4.5 text-success" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Hero visual: collage with floating card */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/4.4] w-full overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-[0_24px_60px_rgba(75,33,66,0.18)] sm:aspect-[4/3.6]">
              <Image
                src="/images/hero.jpg"
                alt="A warm, beautifully arranged living room with a cream sofa and styled shelves"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
            </div>
            {/* floating mini product card */}
            <div className="absolute -left-3 top-6 hidden w-36 overflow-hidden rounded-2xl border border-border bg-white p-2 shadow-lg sm:block lg:-left-8">
              <div className="relative h-24 overflow-hidden rounded-xl">
                <Image
                  src="/images/products/moon-lamp.jpg"
                  alt="LED Moon Lamp glowing softly"
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </div>
              <p className="mt-2 px-1 text-[11px] font-semibold leading-tight">
                LED Moon Lamp
              </p>
              <p className="px-1 pb-1 text-[11px] font-bold text-primary">
                ₹499 <span className="font-normal text-muted-foreground line-through">₹749</span>
              </p>
            </div>
            {/* floating WhatsApp card */}
            <div className="absolute -bottom-5 right-3 flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-lg sm:right-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25d366]/15">
                <MessageCircle className="h-5 w-5 fill-[#25d366] text-[#25d366]" aria-hidden />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-foreground">
                  Easy WhatsApp Ordering
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Confirm in one tap — no app signup
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B. Shop by Category --------------------------------------------------- */}
      <section aria-labelledby="shop-category" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Find the right corner of your home"
        />
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/shop?category=${encodeURIComponent(category)}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-lg sm:aspect-[4/4.4]"
            >
              {CATEGORY_IMAGES[category] && (
                <Image
                  src={CATEGORY_IMAGES[category]}
                  alt={category}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="img-zoom object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-display text-lg font-bold text-white sm:text-xl">
                  {category}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-white/85">
                  Shop now <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* C. Best Sellers -------------------------------------------------------- */}
      <section aria-labelledby="best-sellers" className="bg-cream py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Best Sellers"
              title="Local favourites, restocked often"
            />
            <Link
              href="/shop?badge=Best%20Seller"
              className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex"
            >
              View all <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {hydrated
              ? bestSellers.map((p) => <ProductCard key={p.id} product={p} />)
              : Array.from({ length: 4 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
          </div>
        </div>
      </section>

      {/* D. Direct Ordering Banner ---------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-primary px-6 py-10 sm:px-10 sm:py-12">
          <div
            aria-hidden
            className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/20 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-plum-soft/40 blur-2xl"
          />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
                Direct ordering
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                See it. Add it. WhatsApp us.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">
                No accounts, no card details. Your cart becomes a ready-made
                WhatsApp message — we confirm availability and delivery, then
                send it on its way.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-7 rounded-full bg-gold px-7 text-base font-bold text-primary hover:bg-gold-deep hover:text-white"
              >
                <Link href="/shop">
                  <Search className="h-5 w-5" aria-hidden />
                  Start Shopping
                </Link>
              </Button>
            </div>
            <ol className="grid gap-3">
              {[
                {
                  icon: Search,
                  step: "1 · Browse",
                  text: "Explore useful finds for every room.",
                },
                {
                  icon: ShoppingBag,
                  step: "2 · Add to cart",
                  text: "Pick quantities — live stock keeps it honest.",
                },
                {
                  icon: MessageCircle,
                  step: "3 · Confirm on WhatsApp",
                  text: "Send your order in one tap. We reply fast.",
                },
              ].map(({ icon: Icon, step, text }) => (
                <li
                  key={step}
                  className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{step}</p>
                    <p className="text-xs text-white/70">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* E. New Arrivals ----------------------------------------------------------- */}
      <section aria-labelledby="new-arrivals" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow="New Arrivals"
            title="Fresh on our shelves this month"
          />
          <Link
            href="/shop"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex"
          >
            View all <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {hydrated
            ? newArrivals.map((p) => <ProductCard key={p.id} product={p} />)
            : Array.from({ length: 4 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
        </div>
      </section>

      {/* F. Why Vibeful Homes --------------------------------------------------------- */}
      <section aria-labelledby="why-us" className="bg-cream py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Why Vibeful Homes"
            title="A little store that cares about your home"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: PackageSearch,
                title: "Curated useful finds",
                text: "Every product is hand-picked for daily Indian homes — no filler, no gimmicks.",
              },
              {
                icon: MessageCircle,
                title: "Easy ordering",
                text: "Browse, add to cart, and send the order on WhatsApp. Simple, familiar, fast.",
              },
              {
                icon: HandHeart,
                title: "Helpful local support",
                text: "Questions about size, colour or use? Message us — a real person replies.",
              },
              {
                icon: Wallet,
                title: "Great value",
                text: "Fair prices with honest discounts, plus local delivery without the markup.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Icon className="h-5.5 w-5.5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-bold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* G. Customer Reviews (demo display, labelled) ------------------------------------ */}
      <section aria-labelledby="reviews" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Customer Reviews"
            title="What our customers say"
          />
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Badge variant="outline" className="border-gold/50 text-gold-deep">
              Demo display
            </Badge>
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              quote:
                "The product quality are very good with affordable prices.",
              name: "Local customer",
            },
            {
              quote:
                "Quick reply on WhatsApp and the kitchen scale was exactly as shown.",
              name: "Priya S.",
            },
            {
              quote:
                "Useful products at fair prices. The organiser quality is nice.",
              name: "Rahul K.",
            },
          ].map((r) => (
            <figure
              key={r.name}
              className="flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-sm"
            >
              <Stars rating={5} size="md" />
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/90">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  {r.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-bold">{r.name}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-gold text-gold" aria-hidden />
                    Verified WhatsApp buyer
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* H. Store Visit / Contact CTA ------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1fr_1.1fr]">
            <div className="relative min-h-[16rem] lg:min-h-full">
              <Image
                src="/images/store.jpg"
                alt="A warm home corner styled with a lamp and plants"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent lg:bg-gradient-to-r" />
              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-success shadow">
                <Clock className="h-4 w-4" aria-hidden />
                Open now · Closes 10 PM
              </div>
            </div>
            <div className="p-7 sm:p-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
                Visit our store
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
                {settings.businessName}
              </h2>
              <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" aria-hidden />
                  <span className="leading-relaxed">{settings.address}</span>
                </p>
                <p className="flex items-center gap-3">
                  <Phone className="h-4.5 w-4.5 shrink-0 text-primary" aria-hidden />
                  <a
                    href={telLink(settings.phone)}
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    {settings.phone}
                  </a>
                  <span className="text-muted-foreground/70">· calls & WhatsApp</span>
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="rounded-full bg-primary hover:bg-plum-soft"
                >
                  <a href={telLink(settings.phone)}>
                    <Phone className="h-4 w-4" aria-hidden /> Call Store
                  </a>
                </Button>
                <Button
                  asChild
                  className="rounded-full bg-[#1e9e4b] hover:bg-[#178a41]"
                >
                  <a
                    href={waLink(
                      settings.whatsapp,
                      "Hello Vibeful Homes, I would like some help."
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-primary/30 bg-white hover:bg-secondary"
                >
                  <a
                    href={mapsLink(settings.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Compass className="h-4 w-4" aria-hidden /> Get Directions
                  </a>
                </Button>
              </div>
              <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <Home className="h-3.5 w-3.5" aria-hidden />
                Directions open Google Maps in a new tab — Sutahat, Cuttack.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div id={eyebrow.toLowerCase().replace(/\s+/g, "-")}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

function pickBestSellers(products: Product[]): Product[] {
  const best = products.filter((p) => p.badge === "Best Seller" || p.badge === "Popular");
  const rest = products.filter((p) => p.badge !== "Best Seller" && p.badge !== "Popular");
  return [...best, ...rest].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);
}

function pickNewArrivals(products: Product[]): Product[] {
  return [...products]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 4);
}