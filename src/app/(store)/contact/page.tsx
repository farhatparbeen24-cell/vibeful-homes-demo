import type { Metadata } from "next";
import { ContactClient } from "./contact-client";

export const metadata: Metadata = {
  title: "Contact & Store Visit",
  description:
    "Visit Vibeful Homes at Sutahat, Cuttack — call, WhatsApp or get directions. Send us an enquiry.",
};

export default function Page() {
  return <ContactClient />;
}