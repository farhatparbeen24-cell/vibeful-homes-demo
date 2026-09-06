import Link from "next/link";
import { House, SearchX } from "lucide-react";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-4 py-20 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary text-primary">
        <SearchX className="h-10 w-10" aria-hidden />
      </span>
      <p className="mt-8 font-display text-sm font-bold uppercase tracking-[0.22em] text-gold-deep">
        404 — page not found
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        This shelf looks empty
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        The page you are looking for has moved, been renamed, or never existed.
        Let&apos;s get you back to the useful things — our storefront is one
        tap away.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-plum-soft"
        >
          <House className="h-5 w-5" aria-hidden />
          Return to Home
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white px-7 text-base font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          Browse the Shop
        </Link>
      </div>
    </div>
  );
}
