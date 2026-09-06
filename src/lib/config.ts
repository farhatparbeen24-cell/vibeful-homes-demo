// ---------------------------------------------------------------------------
// Vibeful Homes — central site configuration
//
// ⭐ THIS IS THE ONE place to change the demo WhatsApp number and core
//    business details. The value flows into the storefront (floating button,
//    mobile nav, header, footer, contact page) and into the checkout
//    click-to-chat links for every visitor whose browser has not already
//    stored a customized value in localStorage (see below).
//
// Note: the Admin dashboard → Settings page can override these values for
// the current browser only (localStorage). For a fresh deployment the
// defaults below always apply, and "Reset Demo Data" (Admin → Settings)
// restores them.
// ---------------------------------------------------------------------------

export const SITE_CONFIG = {
  /** Store display name. */
  businessName: "Vibeful Homes",

  /**
   * WhatsApp number in international format, digits only (no "+", no
   * spaces). Default demo number: 919583833786
   */
  whatsapp: "919583833786",

  /** Dialable phone format shown on the contact page / tel: links. */
  phone: "095838 33786",

  /** Store address used for the maps link and footer. */
  address:
    "Near Dawa Ghar Medicine Store, Dewan Bazar, Sutahat, Kataka (Cuttack), Odisha 753001",

  /** Opening hours note. */
  hours: "Open daily · Closes 10 PM",

  /** Helper text shown around the checkout flow. */
  orderNote:
    "Availability and delivery charges are confirmed on WhatsApp before dispatch.",
} as const;

/** Public site URL — used for metadata only. Override with NEXT_PUBLIC_SITE_URL on Vercel. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
