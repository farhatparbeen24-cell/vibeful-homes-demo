"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Home, Lock, Mail, Eye, EyeOff, KeyRound, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHydrated, useSession, login } from "@/lib/store";

const DEMO_ACCOUNTS = [
  {
    role: "Admin / Owner",
    email: "admin@vibefulhomes.demo",
    password: "Demo@123",
    can: "Everything — products, inventory, orders, staff, settings",
  },
  {
    role: "Manager",
    email: "manager@vibefulhomes.demo",
    password: "Demo@123",
    can: "Products, inventory, orders",
  },
  {
    role: "Order Staff",
    email: "staff@vibefulhomes.demo",
    password: "Demo@123",
    can: "Dashboard + order status updates",
  },
];

export function LoginClient() {
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already signed in? Straight to the dashboard.
  useEffect(() => {
    if (hydrated && session) {
      router.replace("/admin");
    }
  }, [hydrated, session, router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    // Small delay so the demo feels like a real auth check.
    setTimeout(() => {
      const result = login(email, password);
      setBusy(false);
      if (result) {
        toast.success(`Welcome back, ${result.name}`, {
          description: `Signed in as ${result.role}`,
        });
        router.replace("/admin");
      } else {
        setError("Incorrect email or password, or this account is inactive.");
      }
    }, 450);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f1ec]">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Home className="h-4.5 w-4.5" aria-hidden />
          </span>
          <span className="font-display text-lg font-bold text-primary">
            Vibeful Homes
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-primary"
        >
          ← Back to store
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Login form */}
          <div className="rounded-3xl border border-border bg-white p-7 shadow-lg sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="h-6 w-6" aria-hidden />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to manage products, inventory, orders and staff.
            </p>

            <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@vibefulhomes.demo"
                    autoComplete="email"
                    required
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                    className="h-11 pl-10 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={busy || !hydrated}
                className="h-11 w-full rounded-full bg-primary text-base hover:bg-plum-soft"
              >
                {busy ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Demo authentication — sessions persist in this browser only.
            </p>
          </div>

          {/* Demo credentials card */}
          <aside className="rounded-3xl border border-gold/40 bg-gold-soft/60 p-6 sm:p-7">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gold-deep">
              Demo credentials
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-foreground/70">
              Three roles are pre-loaded. Tap a card to fill the form.
            </p>
            <div className="mt-4 space-y-3">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.password);
                    setError("");
                  }}
                  className="w-full rounded-2xl border border-border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="flex items-center justify-between text-sm font-bold">
                    {acc.role}
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                      {acc.email.split("@")[0]}
                    </span>
                  </p>
                  <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                    {acc.email} · {acc.password}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {acc.can}
                  </p>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </main>

      <footer className="px-6 py-5 text-center text-xs text-muted-foreground">
        Vibeful Homes · Demo Version — dashboard data is stored locally in
        your browser
      </footer>
    </div>
  );
}