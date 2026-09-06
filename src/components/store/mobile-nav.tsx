"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Store, MessageCircle } from "lucide-react";
import { useCart, useHydrated, useSettings } from "@/lib/store";
import { cartCount } from "@/lib/format";

/** Mobile bottom navigation: Home · Shop · Cart · WhatsApp */
export function MobileBottomNav() {
  const pathname = usePathname();
  const cart = useCart();
  const hydrated = useHydrated();
  const settings = useSettings();
  const count = hydrated ? cartCount(cart) : 0;

  const items = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/shop",
      label: "Shop",
      icon: Store,
      active: pathname.startsWith("/shop") || pathname.startsWith("/product/"),
    },
    {
      href: "/cart",
      label: "Cart",
      icon: ShoppingBag,
      active: pathname.startsWith("/cart"),
      badge: count,
    },
    {
      href: `https://wa.me/${settings.whatsapp}`,
      label: "WhatsApp",
      icon: MessageCircle,
      external: true,
    },
  ];

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <span className="relative">
                <Icon
                  className={`h-5 w-5 ${item.active ? "text-primary" : "text-muted-foreground"}`}
                  aria-hidden
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </span>
              <span
                className={`text-[11px] font-medium ${
                  item.active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </>
          );
          const cls = `flex min-h-[3.25rem] flex-col items-center justify-center gap-1 py-2 active:bg-secondary/60 ${
            item.active ? "bg-secondary/40" : ""
          }`;
          return item.external ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cls}
            >
              {content}
            </a>
          ) : (
            <Link key={item.label} href={item.href} className={cls}>
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}