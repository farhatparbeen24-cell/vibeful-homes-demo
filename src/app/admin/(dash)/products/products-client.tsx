"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  PackageX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionGate } from "@/components/admin/permission-gate";
import {
  useHydrated,
  useProducts,
  useSession,
  deleteProduct,
  saveProduct,
} from "@/lib/store";
import { inr } from "@/lib/format";
import { CATEGORIES, type Product } from "@/lib/types";

interface FormState {
  id?: string;
  images: string;
  name: string;
  slug: string;
  category: string;
  price: string;
  mrp: string;
  stock: string;
  description: string;
  shortDescription: string;
  rating: string;
  reviewCount: string;
  badge: string;
  status: "Active" | "Draft";
  featured: boolean;
  variantOptions: string;
  variantLabel: string;
}

const EMPTY_FORM: FormState = {
  images: "",
  name: "",
  slug: "",
  category: "Kitchen",
  price: "",
  mrp: "",
  stock: "",
  description: "",
  shortDescription: "",
  rating: "4.5",
  reviewCount: "0",
  badge: "",
  status: "Active",
  featured: false,
  variantOptions: "",
  variantLabel: "Colour",
};

export function ProductsClient() {
  const hydrated = useHydrated();
  const session = useSession();
  const products = useProducts();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q))
        return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [products, query, categoryFilter, statusFilter]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setForm({
      id: product.id,
      images: product.images.join("\n"),
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: String(product.price),
      mrp: String(product.mrp),
      stock: String(product.stock),
      description: product.description,
      shortDescription: product.shortDescription,
      rating: String(product.rating),
      reviewCount: String(product.reviewCount),
      badge: product.badge ?? "",
      status: product.status,
      featured: product.featured,
      variantOptions: product.variants?.options.join(", ") ?? "",
      variantLabel: product.variants?.label ?? "Colour",
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = "Product name is required.";
    if (!/^[a-z0-9-]+$/.test(form.slug.trim()))
      e.slug = "Slug: lowercase letters, numbers and hyphens only.";
    if (!CATEGORIES.includes(form.category as (typeof CATEGORIES)[number]))
      e.category = "Pick a valid category.";
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) e.price = "Enter a valid price.";
    const mrp = Number(form.mrp);
    if (!Number.isFinite(mrp) || mrp <= 0) e.mrp = "Enter a valid MRP.";
    else if (mrp < price) e.mrp = "MRP cannot be lower than the price.";
    const stock = Number(form.stock);
    if (!Number.isInteger(stock) || stock < 0)
      e.stock = "Stock must be 0 or more.";
    if (form.images.trim().length < 8) e.images = "Add at least one image URL.";
    if (form.shortDescription.trim().length < 20)
      e.shortDescription = "Short description (20+ characters) shows on cards.";
    if (form.description.trim().length < 40)
      e.description = "Full description should be at least 40 characters.";
    const rating = Number(form.rating);
    if (!(rating >= 0 && rating <= 5)) e.rating = "Rating must be 0–5.";
    if (form.variantOptions.trim() && !form.variantLabel.trim())
      e.variantLabel = "Add a variant label (e.g. Colour).";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    const actor = session?.name ?? "Admin";
    const images = form.images
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const variantOptions = form.variantOptions
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    // Generate a readable SKU for new products (e.g. VH-KIT-013).
    const catPrefix =
      form.category === "Kitchen"
        ? "KIT"
        : form.category === "Home Utility"
          ? "UTL"
          : form.category === "Storage & Organisers"
            ? "STR"
            : "DEC";
    const newSku = `VH-${catPrefix}-${String(products.length + 1).padStart(3, "0")}`;
    const existing = products.find((p) => p.id === form.id);
    saveProduct(
      {
        id: form.id,
        name: form.name.trim(),
        slug: form.slug.trim(),
        category: form.category as Product["category"],
        price: Number(form.price),
        mrp: Number(form.mrp),
        stock: Number(form.stock),
        rating: Number(form.rating),
        reviewCount: Number(form.reviewCount) || 0,
        badge: form.badge.trim() || null,
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        images,
        variants: variantOptions.length
          ? { label: form.variantLabel.trim(), options: variantOptions }
          : null,
        sku: existing?.sku ?? newSku,
        status: form.status,
        featured: form.featured,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      },
      actor
    );
    toast.success(form.id ? "Product updated" : "Product added", {
      description: form.name,
    });
    setModalOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id, session?.name ?? "Admin");
    toast.success("Product deleted", { description: deleteTarget.name });
    setDeleteTarget(null);
  }

  return (
    <PermissionGate area="products">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              Products
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {products.length} products · every edit persists in this browser
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="rounded-full bg-primary hover:bg-plum-soft"
          >
            <Plus className="h-4 w-4" aria-hidden /> Add Product
          </Button>
        </div>

        {/* Search + filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or SKU…"
              className="h-10 rounded-full bg-white pl-10"
              aria-label="Search products"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 w-40 rounded-full bg-white" aria-label="Filter by category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-36 rounded-full bg-white" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table / cards */}
        {!hydrated ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-white px-6 py-14 text-center">
            <PackageX className="h-9 w-9 text-muted-foreground" aria-hidden />
            <p className="mt-4 text-sm font-semibold">No products match</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try clearing the search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-border bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[52rem] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-cream/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-3 font-semibold">Product</th>
                      <th className="px-3 py-3 font-semibold">Category</th>
                      <th className="px-3 py-3 font-semibold">Price</th>
                      <th className="px-3 py-3 font-semibold">Stock</th>
                      <th className="px-3 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-cream/60">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                              {p.images[0] && (
                                <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="line-clamp-1 font-semibold">{p.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {p.sku} · {p.rating}★ ({p.reviewCount})
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{p.category}</td>
                        <td className="px-3 py-3">
                          <span className="font-bold">{inr(p.price)}</span>
                          {p.mrp > p.price && (
                            <span className="ml-1.5 text-xs text-muted-foreground line-through">
                              {inr(p.mrp)}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <Badge
                            className={
                              p.stock <= 0
                                ? "border-none bg-danger text-white"
                                : p.stock <= 7
                                  ? "border-none bg-gold text-white"
                                  : "border-none bg-success/10 text-success"
                            }
                          >
                            {p.stock}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">
                          <Badge
                            variant="outline"
                            className={
                              p.status === "Active"
                                ? "border-success/40 text-success"
                                : "border-border text-muted-foreground"
                            }
                          >
                            {p.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`}>
                              <Pencil className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-danger hover:bg-danger/10"
                              onClick={() => setDeleteTarget(p)}
                              aria-label={`Delete ${p.name}`}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 lg:hidden">
              {filtered.map((p) => (
                <div key={p.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                  <div className="flex gap-3">
                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {p.images[0] && (
                        <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold">{p.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.category} · {inr(p.price)}
                        {p.mrp > p.price && (
                          <span className="ml-1 line-through">{inr(p.mrp)}</span>
                        )}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge
                          className={
                            p.stock <= 0
                              ? "border-none bg-danger text-white"
                              : p.stock <= 7
                                ? "border-none bg-gold text-white"
                                : "border-none bg-success/10 text-success"
                          }
                        >
                          stock {p.stock}
                        </Badge>
                        <Badge variant="outline" className={p.status === "Active" ? "border-success/40 text-success" : ""}>
                          {p.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => openEdit(p)}>
                      <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-full border-danger/40 text-danger hover:bg-danger/10"
                      onClick={() => setDeleteTarget(p)}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {form.id ? "Edit product" : "Add new product"}
            </DialogTitle>
            <DialogDescription>
              Changes are saved to this browser instantly. Customer pages use
              them immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name *" error={errors.name} className="sm:col-span-2">
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Digital Kitchen Weighing Scale" />
            </Field>
            <Field label="Slug *" error={errors.slug}>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") }))} placeholder="digital-kitchen-scale" />
            </Field>
            <Field label="Category *" error={errors.category}>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Price (₹) *" error={errors.price}>
              <Input type="number" min="1" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="699" />
            </Field>
            <Field label="MRP (₹) *" error={errors.mrp}>
              <Input type="number" min="1" value={form.mrp} onChange={(e) => setForm((f) => ({ ...f, mrp: e.target.value }))} placeholder="999" />
            </Field>
            <Field label="Stock units *" error={errors.stock}>
              <Input type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} placeholder="14" />
            </Field>
            <Field label="Rating (0–5) *" error={errors.rating}>
              <Input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} />
            </Field>
            <Field label="Review count" error={errors.reviewCount}>
              <Input type="number" min="0" value={form.reviewCount} onChange={(e) => setForm((f) => ({ ...f, reviewCount: e.target.value }))} />
            </Field>
            <Field label="Badge" error={errors.badge}>
              <Select value={form.badge || "none"} onValueChange={(v) => setForm((f) => ({ ...f, badge: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="No badge" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No badge</SelectItem>
                  <SelectItem value="Best Seller">Best Seller</SelectItem>
                  <SelectItem value="Popular">Popular</SelectItem>
                  <SelectItem value="New Arrival">New Arrival</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as "Active" | "Draft" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active (visible in store)</SelectItem>
                  <SelectItem value="Draft">Draft (hidden)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Image URLs (one per line) *" error={errors.images} className="sm:col-span-2">
              <Textarea rows={3} value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))} placeholder="https://…" className="font-mono text-xs" />
            </Field>
            <Field label="Variant label" error={errors.variantLabel}>
              <Input value={form.variantLabel} onChange={(e) => setForm((f) => ({ ...f, variantLabel: e.target.value }))} placeholder="Colour" />
            </Field>
            <Field label="Variant options (comma-separated)" error={errors.variantOptions}>
              <Input value={form.variantOptions} onChange={(e) => setForm((f) => ({ ...f, variantOptions: e.target.value }))} placeholder="White, Black" />
            </Field>
            <Field label="Short description *" error={errors.shortDescription} className="sm:col-span-2">
              <Input value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} placeholder="One line shown on product cards (20+ characters)" />
            </Field>
            <Field label="Full description *" error={errors.description} className="sm:col-span-2">
              <Textarea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Full product description shown on the product page…" />
            </Field>
            <label className="flex items-center gap-3 rounded-xl border border-border bg-cream p-3.5 sm:col-span-2">
              <Checkbox checked={form.featured} onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v === true }))} />
              <span className="text-sm font-medium">Feature on the homepage</span>
            </label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={handleSave} className="rounded-full bg-primary hover:bg-plum-soft">
              <Package className="h-4 w-4" aria-hidden />
              {form.id ? "Save changes" : "Add product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.name}” will be removed from the store. This
              cannot be undone (though you can reset demo data in Settings).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep product</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-danger text-white hover:bg-danger/90"
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionGate>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-sm">{label}</Label>
      {children}
      {error && (
        <p className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}