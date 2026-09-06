"use client";

import { useSettings } from "@/lib/store";
import { waLink } from "@/lib/format";
import { MessageCircle } from "lucide-react";

/** Sticky floating WhatsApp button on all public pages. */
export function WhatsAppFloat() {
  const settings = useSettings();
  return (
    <a
      href={waLink(
        settings.whatsapp,
        "Hello Vibeful Homes, I would like some help with an order."
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95 md:bottom-6 md:right-6"
    >
      <MessageCircle className="h-7 w-7" aria-hidden />
      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#25d366]" />
      </span>
    </a>
  );
}