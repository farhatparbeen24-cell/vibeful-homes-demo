"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  UserPlus,
  Pencil,
  Trash2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
  useSession,
  useStaff,
  deleteStaff,
  saveStaff,
  PROTECTED_STAFF_ID,
} from "@/lib/store";
import { formatDate } from "@/lib/format";
import type { StaffRole, StaffUser } from "@/lib/types";

const ROLES: StaffRole[] = ["Admin", "Manager", "Order Staff"];

const ROLE_SUMMARY: Record<StaffRole, string> = {
  Admin: "Full access — products, inventory, orders, staff, settings",
  Manager: "Products, inventory and orders",
  "Order Staff": "Dashboard and order status updates only",
};

interface FormState {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: StaffRole;
  active: boolean;
}

const EMPTY: FormState = {
  name: "",
  email: "",
  password: "",
  role: "Order Staff",
  active: true,
};

export function StaffClient() {
  const hydrated = useHydrated();
  const session = useSession();
  const staff = useStaff();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);

  function openCreate() {
    setForm(EMPTY);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(user: StaffUser) {
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      active: user.active,
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = "Enter the staff member's name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Enter a valid email address.";
    else if (
      staff.some(
        (s) =>
          s.id !== form.id &&
          s.email.toLowerCase() === form.email.trim().toLowerCase()
      )
    )
      e.email = "This email is already used by another staff account.";
    if (form.password.trim().length < 6)
      e.password = "Password must be at least 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    saveProduct2();
    toast.success(form.id ? "Staff updated" : "Staff added", {
      description: `${form.name} · ${form.role}`,
    });
    setModalOpen(false);
  }

  function saveProduct2() {
    saveStaff(
      {
        id: form.id,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        active: form.active,
      },
      session?.name ?? "Admin"
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const result = deleteStaff(deleteTarget.id, session?.name ?? "Admin");
    if (!result.ok) {
      toast.error("Cannot remove account", { description: result.error });
    } else {
      toast.success("Staff removed", { description: deleteTarget.name });
    }
    setDeleteTarget(null);
  }

  function toggleActive(user: StaffUser) {
    saveStaff(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        active: !user.active,
      },
      session?.name ?? "Admin"
    );
    toast.success(
      !user.active ? "Account reactivated" : "Account deactivated",
      { description: user.name }
    );
  }

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <PermissionGate area="staff">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Staff</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {staff.length} accounts · role changes and logins are recorded
            </p>
          </div>
          <Button onClick={openCreate} className="rounded-full bg-primary hover:bg-plum-soft">
            <UserPlus className="h-4 w-4" aria-hidden /> Add Staff
          </Button>
        </div>

        {!hydrated ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {staff.map((user) => {
              const protectedAccount = user.id === PROTECTED_STAFF_ID;
              return (
                <div
                  key={user.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm ${
                    user.active ? "border-border" : "border-danger/30 bg-danger/[0.03]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
                        user.active
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {initials(user.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold">{user.name}</p>
                        {protectedAccount && (
                          <Badge variant="outline" className="border-gold/50 bg-gold-soft/60 text-gold-deep">
                            <ShieldCheck className="mr-1 h-3 w-3" aria-hidden />
                            Owner
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={
                            user.role === "Admin"
                              ? "border-primary/30 text-primary"
                              : user.role === "Manager"
                                ? "border-plum-soft/40 text-plum-soft"
                                : ""
                          }
                        >
                          {user.role}
                        </Badge>
                        {!user.active && (
                          <Badge className="border-none bg-danger text-white">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {ROLE_SUMMARY[user.role]}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground/70">
                        Last login:{" "}
                        {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                    <label className="flex items-center gap-2.5 rounded-full border border-border px-4 py-2 text-sm font-medium">
                      <Switch
                        checked={user.active}
                        disabled={protectedAccount}
                        onCheckedChange={() => toggleActive(user)}
                        aria-label={`Toggle ${user.name} active status`}
                      />
                      {user.active ? "Active" : "Deactivated"}
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => openEdit(user)}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-auto rounded-full border-danger/40 text-danger hover:bg-danger/10 disabled:opacity-40"
                      disabled={protectedAccount}
                      onClick={() => setDeleteTarget(user)}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-4 w-4" aria-hidden />
          The original owner account can be edited but never removed or
          deactivated.
        </p>
      </div>

      {/* Add / Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {form.id ? "Edit staff member" : "Add staff member"}
            </DialogTitle>
            <DialogDescription>
              {form.id
                ? "Role and access changes take effect on their next login."
                : "Share the temporary password — they can sign in immediately."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Full name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Manoj Sahoo"
              />
              {errors.name && <FieldError message={errors.name} />}
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="name@vibefulhomes.demo"
              />
              {errors.email && <FieldError message={errors.email} />}
            </div>
            <div className="space-y-1.5">
              <Label>{form.id ? "Password" : "Temporary password"} *</Label>
              <Input
                type="text"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Demo@123"
                className="font-mono"
              />
              {errors.password && <FieldError message={errors.password} />}
            </div>
            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm((f) => ({ ...f, role: v as StaffRole }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {ROLE_SUMMARY[form.role]}
              </p>
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-border bg-cream p-3.5">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
                disabled={form.id === PROTECTED_STAFF_ID}
                aria-label="Account active"
              />
              <span className="text-sm font-medium">
                Account active
                {form.id === PROTECTED_STAFF_ID && " (owner is always active)"}
              </span>
            </label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={handleSave} className="rounded-full bg-primary hover:bg-plum-soft">
              {form.id ? "Save changes" : "Add staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this staff account?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} ({deleteTarget?.email}) will lose dashboard
              access immediately. Assigned orders stay in place.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep account</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-danger text-white hover:bg-danger/90"
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionGate>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-xs font-medium text-danger" role="alert">
      {message}
    </p>
  );
}