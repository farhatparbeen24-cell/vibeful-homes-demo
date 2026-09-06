"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/store";
import { ROLE_PERMISSIONS } from "@/lib/types";

/**
 * Route-level permission guard. A Manager or Order Staff typing a
 * restricted URL directly is blocked here — not just via hidden links —
 * and is safely redirected back to the Overview page (which every role
 * can access) after a short, readable notice.
 */
export function PermissionGate({
  area,
  children,
}: {
  area: string;
  children: React.ReactNode;
}) {
  const session = useSession();
  const router = useRouter();
  const allowed = session ? ROLE_PERMISSIONS[session.role].includes(area) : true;

  useEffect(() => {
    if (!session || allowed) return;
    toast.error("Access restricted", {
      description: `Your role (${session.role}) cannot manage ${area}. Taking you back to the overview.`,
    });
    const timer = setTimeout(() => router.replace("/admin"), 1800);
    return () => clearTimeout(timer);
  }, [session, allowed, area, router]);

  if (!session) return null;

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-white px-6 py-20 text-center shadow-sm">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-danger/10 text-danger">
          <ShieldAlert className="h-8 w-8" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold">
          This area is restricted
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Your role ({session.role}) does not have access to {area}{" "}
          management. Please contact the store owner if you need additional
          permissions.
        </p>
        <Button asChild className="mt-6 rounded-full bg-primary hover:bg-plum-soft">
          <Link href="/admin">
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            Back to Overview
          </Link>
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          Redirecting you automatically…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
