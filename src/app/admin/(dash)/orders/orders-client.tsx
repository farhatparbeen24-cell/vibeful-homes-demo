"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ClipboardList,
  Search,
  ChevronRight,
  User,
  MapPin,
  Phone,
  StickyNote,
  MessageCircle,
  IndianRupee,
  CircleCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useHydrated,
  useOrders,
  useSession,
  useStaff,
  assignOrderStaff,
  saveInternalNote,
  setOrderPayment,
  updateOrderStatus,
} from "@/lib/store";
import { formatDate, formatDateTime, inr } from "@/lib/format";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";

const ALL_STATUSES: OrderStatus[] = [
  "New Inquiry",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const PAYMENTS: PaymentStatus[] = ["Pending", "Paid", "Refunded"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  "New Inquiry": "bg-gold-soft text-gold-deep border-gold/50",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Packed: "bg-violet-50 text-violet-700 border-violet-200",
  Shipped: "bg-primary/10 text-primary border-primary/25",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
};

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  "New Inquiry": ["Confirmed", "Cancelled"],
  Confirmed: ["Packed", "Cancelled"],
  Packed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

export function OrdersClient() {
  const hydrated = useHydrated();
  const session = useSession();
  const orders = useOrders();
  const staff = useStaff();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<OrderStatus | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const isOrderStaff = session?.role === "Order Staff";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((o) => {
        if (q) {
          const hay = `${o.id} ${o.customer.name} ${o.customer.mobile} ${o.customer.city}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (statusFilter !== "all" && o.status !== statusFilter) return false;
        if (paymentFilter !== "all" && o.paymentStatus !== paymentFilter)
          return false;
        if (staffFilter !== "all") {
          if (staffFilter === "unassigned" && o.assignedStaff) return false;
          if (
            staffFilter !== "unassigned" &&
            o.assignedStaff !== staffFilter
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [orders, query, statusFilter, paymentFilter, staffFilter]);

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  function openOrder(order: Order) {
    setSelectedId(order.id);
    setNoteDraft(order.internalNotes);
  }

  /**
   * The first New Inquiry → Confirmed transition asks whether to reduce
   * product stock. Later transitions never reduce again (guarded in the
   * store by Order.stockReduced).
   */
  function handleStatusChange(order: Order, next: OrderStatus) {
    if (
      next === "Confirmed" &&
      order.status === "New Inquiry" &&
      !order.stockReduced
    ) {
      setConfirmStatus(next);
      return;
    }
    const result = updateOrderStatus(order.id, next, session?.name ?? "Admin");
    if (result.ok) {
      toast.success(`Order ${next.toLowerCase()}`, {
        description: order.id,
      });
    }
  }

  function handleConfirmWithStock(reduce: boolean) {
    if (!selected || !confirmStatus) return;
    const result = updateOrderStatus(
      selected.id,
      confirmStatus,
      session?.name ?? "Admin",
      { reduceStock: reduce }
    );
    if (result.ok) {
      toast.success("Order confirmed", {
        description: reduce
          ? `${selected.id} — product stock reduced`
          : `${selected.id} — stock left unchanged`,
      });
    }
    setConfirmStatus(null);
  }

  const staffName = (id: string | null) =>
    id ? (staff.find((s) => s.id === id)?.name ?? "Unknown") : "Unassigned";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length} orders · status & assignment changes are logged
          </p>
        </div>
        {isOrderStaff && (
          <Badge variant="outline" className="border-gold/50 bg-gold-soft/60 text-gold-deep">
            Order Staff view — status updates only
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order ID, customer, mobile, city…"
            className="h-10 rounded-full bg-white pl-10"
            aria-label="Search orders"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-40 rounded-full bg-white" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="h-10 w-40 rounded-full bg-white" aria-label="Filter by payment">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            {PAYMENTS.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={staffFilter} onValueChange={setStaffFilter}>
          <SelectTrigger className="h-10 w-44 rounded-full bg-white" aria-label="Filter by staff">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All staff</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {staff.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders table */}
      {!hydrated ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-white px-6 py-14 text-center">
          <ClipboardList className="h-9 w-9 text-muted-foreground" aria-hidden />
          <p className="mt-4 text-sm font-semibold">No orders match</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing the search or filters.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-sm">
              <thead>
                <tr className="border-b border-border bg-cream/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Order ID</th>
                  <th className="px-3 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Items</th>
                  <th className="px-3 py-3 font-semibold">Total</th>
                  <th className="px-3 py-3 font-semibold">Staff</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-cream/60"
                    onClick={() => openOrder(o)}
                  >
                    <td className="px-5 py-3 font-mono text-xs font-bold text-primary">
                      {o.id}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{o.customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.customer.mobile}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {o.items.length} item{o.items.length === 1 ? "" : "s"}
                    </td>
                    <td className="px-3 py-3 font-semibold">{inr(o.subtotal)}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {staffName(o.assignedStaff)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        variant="outline"
                        className={
                          o.paymentStatus === "Paid"
                            ? "border-success/40 text-success"
                            : o.paymentStatus === "Refunded"
                              ? "border-danger/40 text-danger"
                              : ""
                        }
                      >
                        {o.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-full px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          openOrder(o);
                        }}
                      >
                        View <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order detail drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader className="border-b border-border bg-cream/60 p-6 pb-4">
                <SheetTitle className="font-mono text-lg">
                  {selected.id}
                </SheetTitle>
                <SheetDescription className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[selected.status]}`}>
                    {selected.status}
                  </span>
                  <span>·</span>
                  <span>{formatDateTime(selected.createdAt)}</span>
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 p-6">
                {/* Status actions */}
                <section className="space-y-2.5">
                  <h3 className="text-sm font-bold">Update status</h3>
                  <p className="text-xs text-muted-foreground">
                    {selected.stockReduced
                      ? "Stock was already reduced for this order — later changes never reduce again."
                      : "Stock (if any) is only reduced when an inquiry is confirmed."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {NEXT_STATUSES[selected.status].length === 0 ? (
                      <p className="rounded-xl bg-cream px-4 py-3 text-sm text-muted-foreground">
                        This order has reached its final status.
                      </p>
                    ) : (
                      NEXT_STATUSES[selected.status].map((next) => (
                        <Button
                          key={next}
                          onClick={() => handleStatusChange(selected, next)}
                          variant={next === "Cancelled" ? "outline" : "default"}
                          className={`rounded-full ${
                            next === "Cancelled"
                              ? "border-danger/40 text-danger hover:bg-danger/10"
                              : "bg-primary hover:bg-plum-soft"
                          }`}
                        >
                          {next === "Cancelled" ? "Cancel order" : `Mark ${next}`}
                        </Button>
                      ))
                    )}
                  </div>
                </section>

                {/* Customer info */}
                <section className="rounded-2xl border border-border bg-white p-5">
                  <h3 className="text-sm font-bold">Customer</h3>
                  <ul className="mt-3 space-y-2.5 text-sm">
                    <li className="flex items-center gap-2.5">
                      <User className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      {selected.customer.name}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      <a
                        href={`tel:+91${selected.customer.mobile}`}
                        className="font-medium hover:text-primary"
                      >
                        {selected.customer.mobile}
                      </a>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="leading-relaxed text-muted-foreground">
                        {selected.customer.address}, {selected.customer.city} —{" "}
                        {selected.customer.pincode}
                      </span>
                    </li>
                  </ul>
                  {selected.customer.note && (
                    <p className="mt-3 rounded-xl bg-gold-soft/60 p-3 text-xs leading-relaxed">
                      <span className="font-bold">Customer note: </span>
                      {selected.customer.note}
                    </p>
                  )}
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="mt-4 w-full rounded-full bg-[#1e9e4b] text-white hover:bg-[#178a41] hover:text-white"
                  >
                    <a
                      href={`https://wa.me/91${selected.customer.mobile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden />
                      Message customer on WhatsApp
                    </a>
                  </Button>
                </section>

                {/* Items */}
                <section className="rounded-2xl border border-border bg-white p-5">
                  <h3 className="text-sm font-bold">
                    Items ({selected.items.length})
                  </h3>
                  <ul className="mt-3 divide-y divide-border/60">
                    {selected.items.map((item, i) => (
                      <li key={i} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.qty} × {inr(item.price)}
                            {item.variant ? ` · ${item.variant}` : ""}
                          </p>
                        </div>
                        <p className="shrink-0 font-bold">{inr(item.lineTotal)}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <p className="flex items-center gap-1.5 text-sm font-bold">
                      <IndianRupee className="h-4 w-4" aria-hidden /> Subtotal
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {inr(selected.subtotal)}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Delivery charge is confirmed with the customer on WhatsApp.
                  </p>
                </section>

                {/* Staff assignment (hidden for Order Staff role) */}
                {!isOrderStaff && (
                  <section className="space-y-1.5">
                    <Label>Assigned staff</Label>
                    <Select
                      value={selected.assignedStaff ?? "unassigned"}
                      onValueChange={(v) => {
                        const staffId = v === "unassigned" ? null : v;
                        assignOrderStaff(
                          selected.id,
                          staffId,
                          session?.name ?? "Admin"
                        );
                        toast.success(staffId ? "Staff assigned" : "Order unassigned", {
                          description: selected.id,
                        });
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {staff
                          .filter((s) => s.active)
                          .map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} · {s.role}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </section>
                )}

                {/* Payment status (Admin/Manager only) */}
                {!isOrderStaff && (
                  <section className="space-y-1.5">
                    <Label>Payment status</Label>
                    <Select
                      value={selected.paymentStatus}
                      onValueChange={(v) => {
                        setOrderPayment(
                          selected.id,
                          v as PaymentStatus,
                          session?.name ?? "Admin"
                        );
                        toast.success("Payment updated", { description: selected.id });
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENTS.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </section>
                )}

                {/* Status timeline */}
                <section className="rounded-2xl border border-border bg-white p-5">
                  <h3 className="text-sm font-bold">Status history</h3>
                  <ol className="mt-4 space-y-0">
                    {selected.timeline.map((event, i) => (
                      <li key={i} className="relative flex gap-3.5 pb-5 last:pb-0">
                        {i < selected.timeline.length - 1 && (
                          <span
                            aria-hidden
                            className="absolute left-[0.4375rem] top-4 h-full w-px bg-border"
                          />
                        )}
                        <span className="relative mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            {event.status}
                            {event.status === "Delivered" && (
                              <CircleCheck className="ml-1.5 inline h-4 w-4 text-success" aria-hidden />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {event.by} · {formatDateTime(event.timestamp)}
                          </p>
                          {event.note && (
                            <p className="mt-1 rounded-lg bg-cream px-2.5 py-1.5 text-xs text-muted-foreground">
                              {event.note}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                {/* Internal notes */}
                <section className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <StickyNote className="h-4 w-4 text-muted-foreground" aria-hidden />
                    Internal notes
                  </Label>
                  <Textarea
                    rows={3}
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Visible to staff only — e.g. packing instructions, follow-ups…"
                  />
                  <Button
                    size="sm"
                    className="rounded-full bg-primary hover:bg-plum-soft"
                    onClick={() => {
                      saveInternalNote(
                        selected.id,
                        noteDraft,
                        session?.name ?? "Admin"
                      );
                      toast.success("Note saved", { description: selected.id });
                    }}
                  >
                    Save note
                  </Button>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirm → reduce stock dialog */}
      <AlertDialog
        open={!!confirmStatus}
        onOpenChange={(o) => !o && setConfirmStatus(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reduce product stock for this confirmed order?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirming {selected?.id} for the first time. Choose “Confirm &
              reduce stock” to subtract the ordered quantities from inventory
              (recorded in the adjustment log). This can also be skipped —
              stock stays unchanged. Either way, stock is never reduced again
              for this order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel
              onClick={() => handleConfirmWithStock(false)}
              className="rounded-full"
            >
              Confirm without stock change
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirmWithStock(true)}
              className="rounded-full bg-success text-white hover:bg-success/90"
            >
              Confirm & reduce stock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}