"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { House } from "lucide-react";

/**
 * next/image with a branded fallback: if a src is missing, empty or fails
 * to load (e.g. a stale URL in an old browser's localStorage cart), the
 * product card shows the Vibeful Homes placeholder instead of a broken
 * image. All usages are `fill`-mode images inside sized containers.
 */
export function SafeImage({
  src,
  alt,
  ...rest
}: Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
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
