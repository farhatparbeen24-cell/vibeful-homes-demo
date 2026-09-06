import type { Metadata } from "next";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Enter your delivery details and send your Vibeful Homes order on WhatsApp.",
};

export default function Page() {
  return <CheckoutClient />;
}