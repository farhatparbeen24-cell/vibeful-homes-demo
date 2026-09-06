import type { Metadata } from "next";
import { ProductsClient } from "./products-client";

export const metadata: Metadata = {
  title: "Products",
};

export default function Page() {
  return <ProductsClient />;
}