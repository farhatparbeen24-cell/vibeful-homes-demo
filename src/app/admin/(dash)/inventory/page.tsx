import type { Metadata } from "next";
import { InventoryClient } from "./inventory-client";

export const metadata: Metadata = {
  title: "Inventory",
};

export default function Page() {
  return <InventoryClient />;
}