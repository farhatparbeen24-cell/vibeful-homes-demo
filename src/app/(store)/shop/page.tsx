import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "./shop-client";
import { ShopSkeleton } from "./shop-skeleton";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop useful finds for every corner of home — kitchen tools, utility essentials, organisers and décor at Vibeful Homes.",
};

export default function Page() {
  // useSearchParams() requires a Suspense boundary so the page can still be
  // statically prerendered (client filters hydrate in immediately after).
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopClient />
    </Suspense>
  );
}
