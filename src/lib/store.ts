"use client";

import { useSyncExternalStore } from "react";
import type {
  ActivityEntry,
  AdjustmentReason,
  CartItem,
  CustomerInfo,
  InventoryAdjustment,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  Session,
  StaffUser,
  StoreSettings,
} from "./types";
import {
  SEED_ACTIVITY,
  SEED_ADJUSTMENTS,
  SEED_ORDERS,
  SEED_PRODUCTS,
  SEED_SETTINGS,
  SEED_STAFF,
} from "./seed";
import { generateOrderId } from "./format";

// ---------------------------------------------------------------------------
// Vibeful Homes demo persistence layer (localStorage).
//
// IMPORTANT DEMO RULES
//  1. Seed data loads ONCE, only when localStorage is empty — refreshes never
//     reset user changes.
//  2. Checkout NEVER reduces product stock. Stock is reduced only in the admin
//     panel, the first time an order moves New Inquiry -> Confirmed, and only
//     once per order (guarded by Order.stockReduced).
//  3. Every write emits a change event so all subscribed components re-render.
// ---------------------------------------------------------------------------

const KEYS = {
  products: "vh_products_v1",
  cart: "vh_cart_v1",
  orders: "vh_orders_v1",
  staff: "vh_staff_v1",
  activity: "vh_activity_v1",
  adjustments: "vh_adjustments_v1",
  settings: "vh_settings_v1",
  session: "vh_session_v1",
} as const;

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l());
}

// --- In-memory caches (stable references for useSyncExternalStore) ----------

const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_CART: CartItem[] = [];
const EMPTY_ORDERS: Order[] = [];
const EMPTY_STAFF: StaffUser[] = [];
const EMPTY_ACTIVITY: ActivityEntry[] = [];
const EMPTY_ADJUSTMENTS: InventoryAdjustment[] = [];

let productsCache: Product[] = EMPTY_PRODUCTS;
let cartCache: CartItem[] = EMPTY_CART;
let ordersCache: Order[] = EMPTY_ORDERS;
let staffCache: StaffUser[] = EMPTY_STAFF;
let activityCache: ActivityEntry[] = EMPTY_ACTIVITY;
let adjustmentsCache: InventoryAdjustment[] = EMPTY_ADJUSTMENTS;
let settingsCache: StoreSettings | null = null;
let sessionCache: Session | null = null;
let hydrated = false;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / blocked — demo keeps working in memory
  }
}

let uidCounter = 0;
function uid(prefix: string): string {
  uidCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${uidCounter}`;
}

/** Seeds every collection the first time localStorage is empty. */
function seedIfEmpty() {
  if (window.localStorage.getItem(KEYS.products)) return;
  write(KEYS.products, SEED_PRODUCTS);
  write(KEYS.orders, SEED_ORDERS);
  write(KEYS.staff, SEED_STAFF);
  write(KEYS.activity, SEED_ACTIVITY);
  write(KEYS.adjustments, SEED_ADJUSTMENTS);
  write(KEYS.settings, SEED_SETTINGS);
}

function hydrateOnce() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  seedIfEmpty();
  productsCache = read(KEYS.products, SEED_PRODUCTS);
  cartCache = read<CartItem[]>(KEYS.cart, []);
  ordersCache = read(KEYS.orders, SEED_ORDERS);
  staffCache = read(KEYS.staff, SEED_STAFF);
  activityCache = read(KEYS.activity, SEED_ACTIVITY);
  adjustmentsCache = read(KEYS.adjustments, SEED_ADJUSTMENTS);
  settingsCache = read(KEYS.settings, SEED_SETTINGS);
  sessionCache = read<Session | null>(KEYS.session, null);
}

// --- Hooks ------------------------------------------------------------------

export function useProducts(): Product[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrateOnce();
      return productsCache;
    },
    () => EMPTY_PRODUCTS
  );
}

export function useCart(): CartItem[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrateOnce();
      return cartCache;
    },
    () => EMPTY_CART
  );
}

export function useOrders(): Order[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrateOnce();
      return ordersCache;
    },
    () => EMPTY_ORDERS
  );
}

export function useStaff(): StaffUser[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrateOnce();
      return staffCache;
    },
    () => EMPTY_STAFF
  );
}

export function useActivity(): ActivityEntry[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrateOnce();
      return activityCache;
    },
    () => EMPTY_ACTIVITY
  );
}

export function useAdjustments(): InventoryAdjustment[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrateOnce();
      return adjustmentsCache;
    },
    () => EMPTY_ADJUSTMENTS
  );
}

export function useSettings(): StoreSettings {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrateOnce();
      return settingsCache ?? SEED_SETTINGS;
    },
    () => SEED_SETTINGS
  );
}

export function useSession(): Session | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrateOnce();
      return sessionCache;
    },
    () => null
  );
}

/** True once client data is ready (prevents hydration flicker). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrateOnce();
      return true;
    },
    () => false
  );
}

// --- Internal helpers --------------------------------------------------------

function setProducts(next: Product[]) {
  productsCache = next;
  write(KEYS.products, next);
  emit();
}

function setCart(next: CartItem[]) {
  cartCache = next;
  write(KEYS.cart, next);
  emit();
}

function setOrders(next: Order[]) {
  ordersCache = next;
  write(KEYS.orders, next);
  emit();
}

function setStaff(next: StaffUser[]) {
  staffCache = next;
  write(KEYS.staff, next);
  emit();
}

export function logActivity(actor: string, action: string) {
  const entry: ActivityEntry = {
    id: uid("act"),
    timestamp: new Date().toISOString(),
    actor,
    action,
  };
  activityCache = [entry, ...activityCache].slice(0, 200);
  write(KEYS.activity, activityCache);
  emit();
}

// --- Cart actions -------------------------------------------------------------

export function addToCart(
  product: Product,
  qty: number,
  variant: string | null
): { ok: boolean; reason?: string } {
  const existing = cartCache.find(
    (i) => i.productId === product.id && i.variant === variant
  );
  const currentQty = existing?.qty ?? 0;
  if (currentQty + qty > product.stock) {
    return {
      ok: false,
      reason: `Only ${product.stock} in stock${
        currentQty > 0 ? ` (you already have ${currentQty} in the cart)` : ""
      }`,
    };
  }
  if (existing) {
    setCart(
      cartCache.map((i) =>
        i.productId === product.id && i.variant === variant
          ? { ...i, qty: i.qty + qty, maxStock: product.stock }
          : i
      )
    );
  } else {
    setCart([
      ...cartCache,
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? "",
        variant,
        qty,
        maxStock: product.stock,
      },
    ]);
  }
  return { ok: true };
}

export function updateCartQty(productId: string, variant: string | null, qty: number) {
  if (qty <= 0) {
    removeCartItem(productId, variant);
    return;
  }
  const product = productsCache.find((p) => p.id === productId);
  const cap = product ? product.stock : 99;
  setCart(
    cartCache.map((i) =>
      i.productId === productId && i.variant === variant
        ? { ...i, qty: Math.min(qty, cap), maxStock: cap }
        : i
    )
  );
}

export function removeCartItem(productId: string, variant: string | null) {
  setCart(
    cartCache.filter((i) => !(i.productId === productId && i.variant === variant))
  );
}

export function clearCart() {
  setCart([]);
}

/** Refresh live stock caps (e.g. after admin stock edits). */
export function syncCartStock() {
  if (cartCache.length === 0) return;
  let changed = false;
  const next = cartCache.map((i) => {
    const product = productsCache.find((p) => p.id === i.productId);
    if (!product) return i;
    const cap = product.stock;
    const qty = Math.min(i.qty, cap);
    if (cap !== i.maxStock || qty !== i.qty) {
      changed = true;
      return { ...i, qty, maxStock: cap };
    }
    return i;
  });
  if (changed) setCart(next);
}

// --- Checkout ------------------------------------------------------------------

/**
 * Creates the order record (localStorage) and returns it.
 * Per spec: stock is NOT reduced here — only in the admin panel on
 * confirmation.
 */
export function createOrder(customer: CustomerInfo, items: CartItem[], subtotal: number): Order {
  const order: Order = {
    id: generateOrderId(ordersCache),
    createdAt: new Date().toISOString(),
    customer,
    items: items.map((i) => ({
      productId: i.productId,
      name: i.name,
      variant: i.variant,
      qty: i.qty,
      price: i.price,
      lineTotal: i.qty * i.price,
    })),
    subtotal,
    status: "New Inquiry",
    paymentStatus: "Pending",
    assignedStaff: null,
    stockReduced: false,
    timeline: [
      {
        status: "New Inquiry",
        timestamp: new Date().toISOString(),
        by: "Customer (WhatsApp)",
      },
    ],
    internalNotes: "",
  };
  setOrders([order, ...ordersCache]);
  return order;
}

// --- Auth ------------------------------------------------------------------------

export function login(email: string, password: string): Session | null {
  const staff = staffCache.find(
    (s) => s.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!staff || staff.password !== password || !staff.active) return null;
  const session: Session = {
    staffId: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
  };
  sessionCache = session;
  write(KEYS.session, session);
  setStaff(
    staffCache.map((s) =>
      s.id === staff.id ? { ...s, lastLogin: new Date().toISOString() } : s
    )
  );
  logActivity(staff.name, "Signed in to the dashboard");
  return session;
}

export function logout() {
  sessionCache = null;
  window.localStorage.removeItem(KEYS.session);
  emit();
}

export function sessionActor(): string {
  return sessionCache?.name ?? "System";
}

// --- Products CRUD -----------------------------------------------------------------

export function saveProduct(input: Omit<Product, "id"> & { id?: string }, actor: string): Product {
  if (input.id) {
    const prev = productsCache.find((p) => p.id === input.id);
    const next = productsCache.map((p) => (p.id === input.id ? ({ ...p, ...input } as Product) : p));
    setProducts(next);
    logActivity(actor, `Updated product “${input.name}”`);
    return { ...(prev ?? {}), ...input } as Product;
  }
  const product: Product = {
    ...input,
    id: uid("prod"),
  };
  setProducts([...productsCache, product]);
  logActivity(actor, `Added new product “${product.name}”`);
  return product;
}

export function deleteProduct(productId: string, actor: string) {
  const product = productsCache.find((p) => p.id === productId);
  setProducts(productsCache.filter((p) => p.id !== productId));
  if (product) logActivity(actor, `Deleted product “${product.name}”`);
}

// --- Inventory ------------------------------------------------------------------------

export function adjustStock(
  productId: string,
  type: "Increase" | "Decrease",
  qty: number,
  reason: AdjustmentReason,
  actor: string
): { ok: boolean; after: number } {
  const product = productsCache.find((p) => p.id === productId);
  if (!product) return { ok: false, after: 0 };
  const before = product.stock;
  const after = Math.max(0, type === "Increase" ? before + qty : before - qty);
  setProducts(
    productsCache.map((p) => (p.id === productId ? { ...p, stock: after } : p))
  );
  const entry: InventoryAdjustment = {
    id: uid("adj"),
    productId,
    productName: product.name,
    type,
    qty,
    reason,
    before,
    after,
    by: actor,
    timestamp: new Date().toISOString(),
  };
  adjustmentsCache = [entry, ...adjustmentsCache];
  write(KEYS.adjustments, adjustmentsCache);
  logActivity(actor, `Updated ${product.name} stock from ${before} to ${after}`);
  emit();
  return { ok: true, after };
}

// --- Orders (admin) ------------------------------------------------------------------

export interface ConfirmOptions {
  reduceStock: boolean;
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  actor: string,
  opts: ConfirmOptions = { reduceStock: false }
): { ok: boolean; error?: string } {
  const order = ordersCache.find((o) => o.id === orderId);
  if (!order) return { ok: false, error: "Order not found" };

  // Stock reduction: only on the FIRST New Inquiry -> Confirmed transition,
  // never on later status changes (guarded by order.stockReduced).
  const wantsReduction =
    opts.reduceStock &&
    status === "Confirmed" &&
    order.status === "New Inquiry" &&
    !order.stockReduced;

  let nextProducts = productsCache;
  if (wantsReduction) {
    nextProducts = productsCache.map((p) => {
      const line = order.items.find((i) => i.productId === p.id);
      if (!line) return p;
      return { ...p, stock: Math.max(0, p.stock - line.qty) };
    });
  }

  const updated: Order = {
    ...order,
    status,
    stockReduced: order.stockReduced || wantsReduction,
    timeline: [
      ...order.timeline,
      {
        status,
        timestamp: new Date().toISOString(),
        by: actor,
        note: wantsReduction ? "Product stock reduced for this order." : undefined,
      },
    ],
  };

  setOrders(ordersCache.map((o) => (o.id === orderId ? updated : o)));
  if (nextProducts !== productsCache) {
    setProducts(nextProducts);
    for (const line of order.items) {
      const entry: InventoryAdjustment = {
        id: uid("adj"),
        productId: line.productId,
        productName: line.name,
        type: "Decrease",
        qty: line.qty,
        reason: "Order adjustment",
        before: Math.max(
          0,
          (productsCache.find((p) => p.id === line.productId)?.stock ?? 0)
        ),
        after: Math.max(
          0,
          (nextProducts.find((p) => p.id === line.productId)?.stock ?? 0)
        ),
        by: actor,
        timestamp: new Date().toISOString(),
      };
      adjustmentsCache = [entry, ...adjustmentsCache];
    }
    write(KEYS.adjustments, adjustmentsCache);
  }
  logActivity(actor, `${status === "Cancelled" ? "Cancelled" : status} order ${orderId}${
    wantsReduction ? " and reduced stock" : ""
  }`);
  syncCartStock();
  return { ok: true };
}

export function assignOrderStaff(orderId: string, staffId: string | null, actor: string) {
  const staff = staffCache.find((s) => s.id === staffId);
  setOrders(
    ordersCache.map((o) => (o.id === orderId ? { ...o, assignedStaff: staffId } : o))
  );
  logActivity(
    actor,
    staff
      ? `Assigned order ${orderId} to ${staff.name}`
      : `Unassigned order ${orderId}`
  );
}

export function setOrderPayment(orderId: string, payment: PaymentStatus, actor: string) {
  setOrders(
    ordersCache.map((o) => (o.id === orderId ? { ...o, paymentStatus: payment } : o))
  );
  logActivity(actor, `Marked order ${orderId} as ${payment}`);
}

export function saveInternalNote(orderId: string, note: string, actor: string) {
  setOrders(
    ordersCache.map((o) => (o.id === orderId ? { ...o, internalNotes: note } : o))
  );
  logActivity(actor, `Updated internal notes for order ${orderId}`);
}

// --- Staff (Admin only) -----------------------------------------------------------------

export function saveStaff(
  input: Omit<StaffUser, "id" | "createdAt" | "lastLogin"> & { id?: string },
  actor: string
) {
  if (input.id) {
    const prev = staffCache.find((s) => s.id === input.id);
    const changes: string[] = [];
    if (prev?.role !== input.role) changes.push(`role to ${input.role}`);
    if (prev?.active !== input.active)
      changes.push(input.active ? "reactivated" : "deactivated");
    if (prev?.name !== input.name) changes.push("name");
    setStaff(
      staffCache.map((s) => (s.id === input.id ? { ...s, ...input } as StaffUser : s))
    );
    logActivity(actor, `Updated staff “${input.name}”${changes.length ? ` — ${changes.join(", ")}` : ""}`);
    return;
  }
  const staff: StaffUser = {
    ...input,
    id: uid("stf"),
    createdAt: new Date().toISOString(),
    lastLogin: null,
  };
  setStaff([...staffCache, staff]);
  logActivity(actor, `Added staff “${staff.name}” as ${staff.role}`);
}

/** The original Admin account can never be deleted. */
export const PROTECTED_STAFF_ID = "s01";

export function deleteStaff(staffId: string, actor: string): { ok: boolean; error?: string } {
  if (staffId === PROTECTED_STAFF_ID) {
    return { ok: false, error: "The owner account cannot be removed." };
  }
  const staff = staffCache.find((s) => s.id === staffId);
  setStaff(staffCache.filter((s) => s.id !== staffId));
  if (staff) logActivity(actor, `Removed staff “${staff.name}”`);
  return { ok: true };
}

// --- Settings (Admin only) -----------------------------------------------------------------

export function saveSettings(next: StoreSettings, actor: string) {
  settingsCache = next;
  write(KEYS.settings, next);
  logActivity(actor, "Updated business settings");
  emit();
}

/** Danger-zone action: restores all seed data and clears customer demo data. */
export function resetDemoData() {
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  hydrated = false;
  seedIfEmpty();
  productsCache = SEED_PRODUCTS;
  cartCache = [];
  ordersCache = SEED_ORDERS;
  staffCache = SEED_STAFF;
  activityCache = SEED_ACTIVITY;
  adjustmentsCache = SEED_ADJUSTMENTS;
  settingsCache = SEED_SETTINGS;
  sessionCache = null;
  emit();
}
