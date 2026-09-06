"use client";

import Link from "next/link";
import {
  Package,
  Boxes,
  AlertTriangle,
  PackageX,
  MessageCircle,
  ClipboardList,
  IndianRupee,
  Activity,
  ArrowRight,
  TrendingUp,
  CircleDot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useActivity,
  useHydrated,
  useOrders,
  useProducts,
  useSession,
} from "@/lib/store";
import { formatDate, inr } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const SALE_STATUSES: OrderStatus[] = ["Confirmed", "Packed", "Shipped", "Delivered"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  "New Inquiry": "bg-gold-soft text-gold-deep border-gold/50",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Packed: "bg-violet-50 text-violet-700 border-violet-200",
  Shipped: "bg-primary/10 text-primary border-primary/25",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
};

export function DashboardClient() {
  const hydrated = useHydrated();
  const session = useSession();
  const products = useProducts();
  const orders = useOrders();
  const activity = useActivity();

  if (!hydrated) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-border bg-white"
          />
        ))}
      </div>
    );
  }

  const totalProducts = products.length;
  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 7);
  const outOfStock = products.filter((p) => p.stock <= 0);
  const newInquiries = orders.filter((o) => o.status === "New Inquiry");
  const estimatedSales = orders
    .filter((o) => SALE_STATUSES.includes(o.status))
    .reduce((s, o) => s + o.subtotal, 0);

  const stats = [
    { label: "Total products", value: totalProducts, icon: Package, tone: "primary" },
    { label: "Units in stock", value: totalUnits, icon: Boxes, tone: "plum" },
    { label: "Low-stock products", value: lowStock.length, icon: AlertTriangle, tone: "gold" },
    { label: "Out of stock", value: outOfStock.length, icon: PackageX, tone: "danger" },
    { label: "New WhatsApp inquiries", value: newInquiries.length, icon: MessageCircle, tone: "gold" },
    { label: "Total orders", value: orders.length, icon: ClipboardList, tone: "plum" },
    { label: "Estimated sales", value: inr(estimatedSales), icon: IndianRupee, tone: "success" },
    { label: "Staff accounts", value: 3, icon: Activity, tone: "primary" },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 6);

  // Simple SVG bar chart: orders by status.
  const statusCounts = (Object.keys(STATUS_STYLES) as OrderStatus[]).map((s) => ({
    status: s,
    count: orders.filter((o) => o.status === s).length,
  }));
  const maxCount = Math.max(1, ...statusCounts.map((s) => s.count));

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Good day, {session?.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is how the store is doing today.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-gold/50 bg-gold-soft/70 font-medium text-gold-deep"
        >
          Demo Version
        </Badge>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <Card
            key={label}
            className="rounded-2xl border-border bg-white shadow-sm"
          >
            <CardContent className="flex items-start justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1.5 truncate text-2xl font-bold text-foreground">
                  {value}
                </p>
              </div>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  TONES[tone]
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Recent orders */}
        <Card className="rounded-2xl bg-white shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-bold">Recent orders</CardTitle>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead>
                  <tr className="border-y border-border/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-2.5 font-semibold">Order</th>
                    <th className="px-3 py-2.5 font-semibold">Customer</th>
                    <th className="px-3 py-2.5 font-semibold">Total</th>
                    <th className="px-5 py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-border/50 last:border-0 hover:bg-cream/70"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href="/admin/orders"
                          className="font-mono text-xs font-bold text-primary hover:underline"
                        >
                          {o.id}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(o.createdAt)}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium">{o.customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.items.length} item{o.items.length === 1 ? "" : "s"}
                        </p>
                      </td>
                      <td className="px-3 py-3 font-semibold">
                        {inr(o.subtotal)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[o.status]}`}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Low stock alert panel */}
          <Card className="rounded-2xl bg-white shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <AlertTriangle className="h-4.5 w-4.5 text-gold-deep" aria-hidden />
                Low stock ({lowStock.length})
              </CardTitle>
              <Link
                href="/admin/inventory"
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Adjust <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {lowStock.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  All products are comfortably stocked.
                </p>
              )}
              {lowStock.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-gold-soft/50 px-3.5 py-2.5"
                >
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">
                    {p.name}
                  </p>
                  <Badge className="shrink-0 border-none bg-danger text-white">
                    {p.stock} left
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Orders by status mini chart */}
          <Card className="rounded-2xl bg-white shadow-sm">
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <TrendingUp className="h-4.5 w-4.5 text-primary" aria-hidden />
                Orders by status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-36 items-end justify-between gap-2.5 pt-3">
                {statusCounts.map((s) => (
                  <div
                    key={s.status}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                    title={`${s.status}: ${s.count}`}
                  >
                    <span className="text-xs font-bold text-foreground">
                      {s.count}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-primary/85 transition-all"
                      style={{ height: `${Math.max(6, (s.count / maxCount) * 88)}%` }}
                    />
                    <span className="flex h-8 w-full items-center justify-center text-center text-[9px] font-semibold leading-tight text-muted-foreground">
                      {s.status === "New Inquiry" ? "New" : s.status.slice(0, 7)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent activity feed */}
      <Card className="rounded-2xl bg-white shadow-sm">
        <CardHeader className="space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Activity className="h-4.5 w-4.5 text-plum-soft" aria-hidden />
            Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3.5">
            {activity.slice(0, 7).map((a) => (
              <li key={a.id} className="flex gap-3.5">
                <CircleDot className="mt-1 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-semibold">{a.actor}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground/70">
                    {formatDate(a.timestamp)}
                  </p>
                </div>
              </li>
            ))}
            {activity.length === 0 && (
              <li className="text-sm text-muted-foreground">
                No activity recorded yet.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

const TONES: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  plum: "bg-plum-soft/15 text-plum-soft",
  gold: "bg-gold-soft text-gold-deep",
  danger: "bg-danger/10 text-danger",
  success: "bg-success/10 text-success",
};