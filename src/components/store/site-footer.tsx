"use client";

import Link from "next/link";
import {
  Home,
  Phone,
  MapPin,
  MessageCircle,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useSettings } from "@/lib/store";
import { telLink, waLink, mapsLink } from "@/lib/format";

export function SiteFooter() {
  const settings = useSettings();

  return (
    <footer className="mt-auto border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Home className="h-4.5 w-4.5" aria-hidden />
            </span>
            <span className="font-display text-lg font-bold">Vibeful Homes</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/80">
            Thoughtfully selected kitchen, utility, storage and décor
            essentials — delivered with friendly local support from Cuttack,
            Odisha.
          </p>
          <p className="mt-4 flex items-start gap-2 text-sm text-primary-foreground/80">
            <Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Local delivery in Cuttack. Final delivery charge is confirmed on
            WhatsApp before dispatch.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { href: "/", label: "Home" },
              { href: "/shop", label: "Shop All Products" },
              { href: "/shop?category=Kitchen", label: "Kitchen" },
              { href: "/shop?category=Storage%20%26%20Organisers", label: "Storage & Organisers" },
              { href: "/shop?category=Home%20D%C3%A9cor", label: "Home Décor" },
              { href: "/cart", label: "Your Cart" },
              { href: "/contact", label: "Contact & Store Visit" },
            ].map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-primary-foreground/80 transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
            Reach Us
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/85">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{settings.address}</span>
            </li>
            <li>
              <a
                href={telLink(settings.phone)}
                className="flex items-center gap-2.5 hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                {settings.phone}
              </a>
            </li>
            <li>
              <a
                href={waLink(settings.whatsapp, "Hello Vibeful Homes, I have a question.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-white"
              >
                <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
                WhatsApp: {settings.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
              {settings.hours}
            </li>
          </ul>
        </div>

        {/* How to order */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
            How Ordering Works
          </h3>
          <ol className="mt-4 space-y-2.5 text-sm text-primary-foreground/80">
            <li>1. Browse and add products to your cart.</li>
            <li>2. Fill your delivery details at checkout.</li>
            <li>3. Tap Send in WhatsApp — we confirm availability and delivery.</li>
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-primary-foreground/60">
            {settings.orderNote}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-primary-foreground/70 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Vibeful Homes · Sutahat, Cuttack</p>
          <p className="flex items-center gap-1.5">
            Demo Version
            <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] tracking-wide">
              local demo data
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}