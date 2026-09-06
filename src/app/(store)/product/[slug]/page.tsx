import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { } from "next";
import { ProductDetailClient } from "./product-client";

export const metadata: Metadata = {
  title: "Product",
  description:
    "Product details at Vibeful Homes — order on WhatsApp with friendly local support.",
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}