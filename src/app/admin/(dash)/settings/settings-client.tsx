"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Save,
  RotateCcw,
  AlertTriangle,
  Store,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionGate } from "@/components/admin/permission-gate";
import {
  useHydrated,
  useSession,
  useSettings,
  resetDemoData,
  saveSettings,
} from "@/lib/store";
import type { StoreSettings } from "@/lib/types";

export function SettingsClient() {
  const hydrated = useHydrated();
  const session = useSession();
  const settings = useSettings();
  // Load current settings into the form once client data is ready
  // (render-adjust pattern — no effect needed).
  const [form, setForm] = useState<StoreSettings>(settings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetConfirm, setResetConfirm] = useState(false);
  if (hydrated && !settingsLoaded) {
    setSettingsLoaded(true);
    setForm(settings);
  }

  function handleSave() {
    const e: Record<string, string> = {};
    if (form.businessName.trim().length < 3)
      e.businessName = "Business name is required.";
    if (!/^[0-9\s+()-]{6,}$/.test(form.phone.trim()))
      e.phone = "Enter a valid phone number.";
    if (!/^\d{10,15}$/.test(form.whatsapp.trim()))
      e.whatsapp = "WhatsApp number: country code + number, digits only (e.g. 919583833786).";
    if (form.address.trim().length < 10)
      e.address = "Enter the full store address.";
    if (form.hours.trim().length < 3) e.hours = "Enter operating hours.";
    if (form.orderNote.trim().length < 10)
      e.orderNote = "Add a short order-confirmation note (10+ characters).";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    saveSettings(
      {
        ...form,
        businessName: form.businessName.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        address: form.address.trim(),
        hours: form.hours.trim(),
        orderNote: form.orderNote.trim(),
      },
      session?.name ?? "Admin"
    );
    toast.success("Settings saved", {
      description: "Storefront contact details updated instantly.",
    });
  }

  function handleReset() {
    resetDemoData();
    setResetConfirm(false);
    toast.success("Demo data restored", {
      description:
        "Products, orders and staff are back to seed values. You have been signed out.",
    });
    setTimeout(() => (window.location.href = "/admin/login"), 900);
  }

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 rounded-full" />
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <PermissionGate area="settings">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Business details used across the storefront and WhatsApp links.
          </p>
        </div>

        {/* Business info */}
        <Card className="rounded-2xl bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Store className="h-4.5 w-4.5 text-primary" aria-hidden />
              Business information
            </CardTitle>
            <CardDescription>
              Saved locally — the store pages and WhatsApp buttons use these
              values immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name *" error={errors.businessName} className="sm:col-span-2">
              <div className="relative">
                <Store className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.businessName}
                  onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </Field>
            <Field label="Phone (display) *" error={errors.phone}>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="pl-10"
                  placeholder="095838 33786"
                />
              </div>
            </Field>
            <Field label="WhatsApp number *" error={errors.whatsapp}>
              <div className="relative">
                <MessageCircle className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.whatsapp}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      whatsapp: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  className="pl-10 font-mono"
                  placeholder="919583833786"
                />
              </div>
            </Field>
            <Field
              label="Full address *"
              error={errors.address}
              className="sm:col-span-2"
            >
              <Textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="resize-none"
              />
            </Field>
            <Field label="Operating hours *" error={errors.hours}>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.hours}
                  onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </Field>
            <Field
              label="Order notification note *"
              error={errors.orderNote}
              className="sm:col-span-2"
            >
              <Textarea
                rows={2}
                value={form.orderNote}
                onChange={(e) => setForm((f) => ({ ...f, orderNote: e.target.value }))}
                className="resize-none"
                placeholder="Shown near checkout & product pages."
              />
            </Field>
          </CardContent>
        </Card>

        {/* Preview info */}
        <Card className="rounded-2xl bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">
              How customers see this
            </CardTitle>
            <CardDescription>
              A live preview of the contact strip customers rely on.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="leading-relaxed">{form.address || "—"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                {form.phone || "—"}
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 shrink-0 text-[#1e9e4b]" aria-hidden />
                wa.me/{form.whatsapp || "—"}
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                {form.hours || "—"}
              </li>
            </ul>
            <Button
              onClick={handleSave}
              className="mt-6 w-full rounded-full bg-primary hover:bg-plum-soft sm:w-auto sm:px-8"
            >
              <Save className="h-4 w-4" aria-hidden /> Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="rounded-2xl border-danger/30 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-danger">
              <AlertTriangle className="h-4.5 w-4.5" aria-hidden />
              Danger zone
            </CardTitle>
            <CardDescription>
              Restore the demo to its original state — useful before showing
              a client a clean run-through.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-danger/25 bg-danger/[0.04] p-5">
              <p className="text-sm font-semibold">Reset Demo Data</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Restores seeded products, orders and staff, and clears cart,
                customer entries, settings changes and saved sessions. This
                action cannot be undone.
              </p>
              <AlertDialog
                open={resetConfirm}
                onOpenChange={setResetConfirm}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-4 rounded-full border-danger/50 text-danger hover:bg-danger/10"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden /> Reset Demo Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Reset all demo data?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Every product, order, staff account, cart and setting in
                      this browser returns to the original seed. You will be
                      signed out of the dashboard.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">
                      Keep my changes
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReset}
                      className="rounded-full bg-danger text-white hover:bg-danger/90"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden /> Yes, reset
                      everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              To change the seed WhatsApp number or the product catalog for
              fresh browsers, edit <code className="font-mono">src/lib/seed.ts</code>.
            </p>
          </CardContent>
        </Card>
      </div>
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