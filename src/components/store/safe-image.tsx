"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { House } from "lucide-react";

/**
 * next/image with a branded fallback: if a src is missing, empty, unsupported
 * or fails to load (e.g. a stale URL in an old browser's localStorage cart),
 * the product card shows the Vibeful Homes placeholder instead of a broken
 * image — or a render-time crash. All usages are `fill`-mode images inside
 * sized containers.
 *
 * ⚠️ next/image THROWS at render time when an absolute http(s) src's hostname
 * is not configured under `images` in next.config. This demo ships every
 * asset locally under /public, so any remote URL (legacy seeded data, or a
 * URL pasted into the admin form) is swapped for the placeholder BEFORE it
 * reaches next/image. A store-side migration also rewrites legacy remote
 * URLs to local files on load (see src/lib/store.ts).
 */
function isRenderable(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//");
}

export function SafeImage({
  src,
  alt,
  ...rest
}: Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed || !isRenderable(src)) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-secondary/70"
        role="img"
        aria-label={alt || "Image unavailable"}
      >
        <House className="h-8 w-8 text-primary/40" aria-hidden />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt ?? ""}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
