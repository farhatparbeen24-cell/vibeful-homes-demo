"use client";

import { Star, StarHalf } from "lucide-react";

const SIZES = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const;

export function Stars({
  rating,
  className = "",
  size = "sm",
}: {
  rating: number;
  className?: string;
  size?: keyof typeof SIZES;
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const cls = SIZES[size];
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-gold ${className}`}
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full)
          return <Star key={i} className={`${cls} fill-gold`} aria-hidden />;
        if (i === full && half)
          return (
            <span key={i} className="relative">
              <Star className={`${cls} fill-muted text-muted`} aria-hidden />
              <StarHalf
                className={`${cls} absolute inset-0 fill-gold text-gold`}
                aria-hidden
              />
            </span>
          );
        return (
          <Star key={i} className={`${cls} fill-muted text-muted`} aria-hidden />
        );
      })}
    </span>
  );
}