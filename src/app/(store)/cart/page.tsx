import type { Metadata } from "next";
import { CartClient } from "./cart-client";

export const metadata: Metadata = {
  title: "Your Cart",
  description:
    "Review your cart at Vibeful Homes and proceed to WhatsApp checkout.",
};

export default function Page() {
  return <CartClient />;
}