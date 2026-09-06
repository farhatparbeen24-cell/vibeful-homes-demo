"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  History,
  Boxes,
  AlertTriangle,
  PackageX,
  PackageCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionGate } from "@/components/admin/permission-gate";
import {
  useAdjustments,
  useHydrated,
  useProducts,
  useSession,
  adjustStock,
} from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import type { AdjustmentReason, Product } from "@/lib/types";

const REASONS: AdjustmentReason[] = [
  "Purchase received",
  "Damage",
  "Manual correction",
  "Order adjustment",
];

const LOW_STOCK_THRESHOLD = 7;

export function InventoryClient() {
  const hydrated = useHydrated();
  const session = useSession();
  const products = useProducts();
  const adjustments = useAdjustments();

  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null);
  const [type, setType] = useState<"Increase" | "Decrease">("Increase");
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState<AdjustmentReason>("Purchase received");
  const [error, setError] = useState("");

  const sorted = useMemo(
    () => [...products].sort((a, b) => a.stock - b.stock),
    [products]
  );

  const recent = useMemo(
    () => adjustments.slice(0, 12),
    [adjustments]
  );

  function openAdjust(product: Product) {
    setAdjustTarget(product);
    setType(product.stock === 0 ? "Increase" : "Decrease");
    setQty("1");
    setReason(product.stock === 0 ? "Purchase received" : "Manual correction");
    setError("");
  }

  function handleAdjust() {
    if (!adjustTarget) return;
    const n = Number(qty);
    if (!Number.isInteger(n) || n <= 0) {
      setError("Quantity must be a whole number greater than zero.");
      return;
    }
    if (type === "Decrease" && n > adjustTarget.stock) {
      setError(
        `Cannot decrease by ${n} — current stock is ${adjustTarget.stock}. Stock can never go negative.`
      );
      return;
    }
    const result = adjustStock(
      adjustTarget.id,
      type,
      n,
      reason,
      session?.name ?? "Admin"
    );
    if (result.ok) {
      toast.success(`${type === "Increase" ? "Increased" : "Decreased"} stock`, {
        description: `${adjustTarget.name}: ${adjustTarget.stock} → ${result.after}`,
      });
      setAdjustTarget(null);
    }
  }

  return (
    <PermissionGate area="inventory">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              Inventory
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Adjust stock safely — it can never go below zero, and every
              change is logged.
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="border-none bg-gold text-white" variant="outline">
              <AlertTriangle className="mr-1 h-3.5 w-3.5" aria-hidden />
              {products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length} low stock
            </Badge>
            <Badge className="border-none bg-danger text-white" variant="outline">
              <PackageX className="mr-1 h-3.5 w-3.5" aria-hidden />
              {products.filter((p) => p.stock <= 0).length} out
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          {/* Stock table */}
          <div className="space-y-3">
            {!hydrated ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-hidden rounded-2xl border border-border bg-white shadow-sm sm:block">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[38rem] text-sm">
                      <thead>
                        <tr className="border-b border-border bg-cream/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="px-5 py-3 font-semibold">SKU</th>
                          <th className="px-3 py-3 font-semibold">Product</th>
                          <th className="px-3 py-3 font-semibold">Stock</th>
                          <th className="px-3 py-3 font-semibold">Status</th>
                          <th className="px-5 py-3 text-right font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.map((p) => (
                          <tr
                            key={p.id}
                            className={`border-b border-border/50 last:border-0 ${
                              p.stock <= 0
                                ? "bg-danger/5"
                                : p.stock <= LOW_STOCK_THRESHOLD
                                  ? "bg-gold-soft/40"
                                  : "hover:bg-cream/60"
                            }`}
                          >
                            <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                              {p.sku}
                            </td>
                            <td className="px-3 py-3">
                              <p className="line-clamp-1 font-medium">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.category}</p>
                            </td>
                            <td className="px-3 py-3 font-bold">{p.stock}</td>
                            <td className="px-3 py-3">
                              <Badge
                                className={
                                  p.stock <= 0
                                    ? "border-none bg-danger text-white"
                                    : p.stock <= LOW_STOCK_THRESHOLD
                                      ? "border-none bg-gold text-white"
                                      : "border-none bg-success/10 text-success"
                                }
                              >
                                {p.stock <= 0 ? "Out of stock" : p.stock <= LOW_STOCK_THRESHOLD ? "Low stock" : "Healthy"}
                              </Badge>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => openAdjust(p)}
                              >
                                <Boxes className="h-3.5 w-3.5" aria-hidden />
                                Adjust
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 sm:hidden">
                  {sorted.map((p) => (
                    <div
                      key={p.id}
                      className={`rounded-2xl border border-border bg-white p-4 shadow-sm ${
                        p.stock <= 0
                          ? "border-danger/30"
                          : p.stock <= LOW_STOCK_THRESHOLD
                            ? "border-gold/40"
                            : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold">{p.name}</p>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">{p.sku}</p>
                        </div>
                        <Badge
                          className={`shrink-0 border-none ${
                            p.stock <= 0
                              ? "bg-danger text-white"
                              : p.stock <= LOW_STOCK_THRESHOLD
                                ? "bg-gold text-white"
                                : "bg-success/10 text-success"
                          }`}
                        >
                          {p.stock} left
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 w-full rounded-full"
                        onClick={() => openAdjust(p)}
                      >
                        <Boxes className="h-3.5 w-3.5" aria-hidden /> Adjust stock
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Adjustment history */}
          <div className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="border-b border-border p-5 pb-3">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <History className="h-4.5 w-4.5 text-plum-soft" aria-hidden />
                Adjustment history
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Full log of stock movements ({adjustments.length} entries)
              </p>
            </div>
            <div className="max-h-[34rem] overflow-y-auto scrollbar-thin">
              <ul className="divide-y divide-border/60">
                {recent.map((a) => (
                  <li key={a.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          a.type === "Increase"
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {a.type === "Increase" ? (
                          <ArrowUp className="h-4 w-4" aria-hidden />
                        ) : (
                          <ArrowDown className="h-4 w-4" aria-hidden />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold">
                          {a.productName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {a.before} → <span className="font-bold text-foreground">{a.after}</span> · {a.reason}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground/70">
                          {a.by} · {formatDateTime(a.timestamp)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
                {adjustments.length === 0 && (
                  <li className="p-6 text-sm text-muted-foreground">
                    No adjustments recorded yet.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Adjust modal */}
      <Dialog open={!!adjustTarget} onOpenChange={(o) => !o && setAdjustTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Adjust stock
            </DialogTitle>
            <DialogDescription className="line-clamp-2">
              {adjustTarget?.name} — current stock:{" "}
              <span className="font-bold text-foreground">
                {adjustTarget?.stock}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType("Increase");
                  setError("");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3.5 text-sm font-bold transition-all ${
                  type === "Increase"
                    ? "border-success bg-success/10 text-success"
                    : "border-border text-muted-foreground hover:border-success/40"
                }`}
              >
                <ArrowUp className="h-4 w-4" aria-hidden /> Increase
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("Decrease");
                  setError("");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3.5 text-sm font-bold transition-all ${
                  type === "Decrease"
                    ? "border-danger bg-danger/10 text-danger"
                    : "border-border text-muted-foreground hover:border-danger/40"
                }`}
              >
                <ArrowDown className="h-4 w-4" aria-hidden /> Decrease
              </button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adj-qty">Quantity *</Label>
              <Input
                id="adj-qty"
                type="number"
                min="1"
                value={qty}
                onChange={(e) => {
                  setQty(e.target.value);
                  setError("");
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Reason *</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as AdjustmentReason)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger" role="alert">
                {error}
              </p>
            )}

            <p className="flex items-start gap-2 rounded-xl bg-cream p-3 text-xs leading-relaxed text-muted-foreground">
              <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              Stock is protected: a decrease larger than current stock is
              rejected, and stock can never fall below zero.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAdjustTarget(null)} className="rounded-full">
              Cancel
            </Button>
            <Button
              onClick={handleAdjust}
              className={`rounded-full text-white ${
                type === "Increase"
                  ? "bg-success hover:bg-success/90"
                  : "bg-danger hover:bg-danger/90"
              }`}
            >
              {type === "Increase" ? "Add stock" : "Reduce stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  );
}