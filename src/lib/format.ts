import type { CartItem, Order, StoreSettings } from "./types";
import { SITE_CONFIG } from "./config";

// ---------------------------------------------------------------------------
// Formatting + WhatsApp link helpers (pure functions, safe on server & client)
// ---------------------------------------------------------------------------

/** ₹ with Indian digit grouping, e.g. ₹1,299 */
export function inr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function discountPercent(mrp: number, price: number): number | null {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Default demo settings. All values come from the ONE central config file
 * (src/lib/config.ts) — change the WhatsApp number there.
 */
export const DEFAULT_SETTINGS: StoreSettings = {
  businessName: SITE_CONFIG.businessName,
  phone: SITE_CONFIG.phone,
  whatsapp: SITE_CONFIG.whatsapp,
  address: SITE_CONFIG.address,
  hours: SITE_CONFIG.hours,
  orderNote: SITE_CONFIG.orderNote,
};

export function waLink(whatsapp: string, message: string): string {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

/** Free Google Maps directions link (search URL — no paid Maps API). */
export function mapsLink(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** VH-YYYYMMDD-####, incrementing from 1001 within the same day. */
export function generateOrderId(orders: Order[]): string {
  const d = new Date();
  const prefix = `VH-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
    d.getDate()
  )}-`;
  let max = 1000;
  for (const o of orders) {
    if (o.id.startsWith(prefix)) {
      const n = parseInt(o.id.slice(prefix.length), 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
  }
  return `${prefix}${max + 1}`;
}

/**
 * The exact WhatsApp order template from the build spec.
 * Every field the customer entered is included so the owner can confirm
 * availability and delivery in one tap.
 */
export function buildOrderMessage(order: Order): string {
  const lines: string[] = [
    "Hello Vibeful Homes,",
    "I would like to place an order.",
    `Order ID: ${order.id}`,
    `Customer Name: ${order.customer.name}`,
    `Mobile Number: ${order.customer.mobile}`,
    `Delivery Address: ${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}`,
    "Order Items:",
  ];
  order.items.forEach((item, i) => {
    lines.push(
      `${i + 1}. ${item.name}${item.variant ? ` (${item.variant})` : ""} x ${
        item.qty
      } — ${inr(item.lineTotal)}`
    );
  });
  lines.push(`Subtotal: ${inr(order.subtotal)}`);
  lines.push("Delivery Charge: To be confirmed");
  lines.push("Payment: To be confirmed");
  lines.push(
    `Order Note: ${order.customer.note?.trim() ? order.customer.note.trim() : "Not provided"}`
  );
  lines.push("Please confirm availability and delivery details. Thank you.");
  return lines.join("\n");
}

/** Direct "order this product" message from a product page. */
export function buildProductEnquiryMessage(
  name: string,
  variant: string | null,
  qty: number,
  total: number
): string {
  return [
    "Hello Vibeful Homes,",
    "I would like to order this product:",
    `${name}${variant ? ` (${variant})` : ""} x ${qty} — ${inr(total)}`,
    "Please confirm availability and delivery details. Thank you.",
  ].join("\n");
}

/** Contact-page enquiry form message. */
export function buildEnquiryMessage(
  name: string,
  mobile: string,
  message: string
): string {
  return [
    "Hello Vibeful Homes,",
    `My name is ${name}.`,
    `Mobile: ${mobile}`,
    "",
    message.trim() || "I have a general enquiry.",
  ].join("\n");
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty * i.price, 0);
}

/** Simple date formatting used across storefront & admin. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${pad(d.getDate())} ${d.toLocaleString("en-IN", {
    month: "short",
    year: "numeric",
  })}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${formatDate(iso)}, ${d.toLocaleString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
}

/** Valid Indian mobile: 10 digits, optionally starting 6-9. */
export function isValidIndianMobile(v: string): boolean {
  return /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ""));
}

export function isValidPincode(v: string): boolean {
  return /^\d{6}$/.test(v.trim());
}
