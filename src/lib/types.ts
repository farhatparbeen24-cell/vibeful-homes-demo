// ---------------------------------------------------------------------------
// Vibeful Homes — shared TypeScript types for the demo data layer.
// All data lives in localStorage; these types keep every entity consistent.
// ---------------------------------------------------------------------------

export const CATEGORIES = [
  "Kitchen",
  "Home Utility",
  "Storage & Organisers",
  "Home Décor",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type ProductStatus = "Active" | "Draft";

export interface ProductVariant {
  /** e.g. "Colour" or "Pack" */
  label: string;
  options: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  /** Selling price in ₹ */
  price: number;
  /** MRP in ₹ (>= price) */
  mrp: number;
  stock: number;
  rating: number;
  reviewCount: number;
  /** "Best Seller" | "Popular" | "New Arrival" | "Low Stock" | null */
  badge: string | null;
  shortDescription: string;
  description: string;
  images: string[];
  variants: ProductVariant | null;
  sku: string;
  status: ProductStatus;
  featured: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  variant: string | null;
  qty: number;
  /** live stock cap for the qty stepper */
  maxStock: number;
}

export type OrderStatus =
  | "New Inquiry"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type PaymentStatus = "Pending" | "Paid" | "Refunded";

export interface OrderItem {
  productId: string;
  name: string;
  variant: string | null;
  qty: number;
  price: number;
  lineTotal: number;
}

export interface OrderEvent {
  status: OrderStatus;
  timestamp: string;
  by: string;
  note?: string;
}

export interface CustomerInfo {
  name: string;
  mobile: string;
  address: string;
  city: string;
  pincode: string;
  note?: string;
}

export interface Order {
  /** Format: VH-YYYYMMDD-#### (e.g. VH-20260906-1001) */
  id: string;
  createdAt: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  /** staff id */
  assignedStaff: string | null;
  /**
   * IMPORTANT (demo rule): stock is never reduced at checkout.
   * It is only reduced here in the admin panel, the first time an order
   * moves from "New Inquiry" to "Confirmed" — and only once per order.
   */
  stockReduced: boolean;
  timeline: OrderEvent[];
  internalNotes: string;
}

export type StaffRole = "Admin" | "Manager" | "Order Staff";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: StaffRole;
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
}

export type AdjustmentReason =
  | "Purchase received"
  | "Damage"
  | "Manual correction"
  | "Order adjustment";

export interface InventoryAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: "Increase" | "Decrease";
  qty: number;
  reason: AdjustmentReason;
  before: number;
  after: number;
  by: string;
  timestamp: string;
}

export interface StoreSettings {
  businessName: string;
  phone: string;
  /** wa.me number without "+" (e.g. 919583833786) */
  whatsapp: string;
  address: string;
  hours: string;
  orderNote: string;
}

export interface Session {
  staffId: string;
  name: string;
  email: string;
  role: StaffRole;
}

/** What each role is allowed to reach (enforced in UI AND at route level). */
export const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  Admin: [
    "dashboard",
    "products",
    "inventory",
    "orders",
    "staff",
    "settings",
  ],
  Manager: ["dashboard", "products", "inventory", "orders"],
  "Order Staff": ["dashboard", "orders"],
};
