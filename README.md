# Vibeful Homes Demo

A premium, fully client-side demo web app for **Vibeful Homes** — a home goods
store from Sutahat, Cuttack (Odisha, India). Customers browse a polished
storefront, build a cart, and send their finished order straight to the
store's **WhatsApp** via official click-to-chat links. A role-based admin
dashboard manages products, inventory, orders, staff and business settings.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui
**No database · no backend API · no external API keys.** All demo data is
persisted in the browser's `localStorage`.

> **Important:** This demo uses browser localStorage. Admin/product/order
> changes are saved only in the current browser and device. It is not a
> shared multi-user production database yet.

---

## Requirements

- **Node.js 18.18 or newer** (Node 20+ recommended)
- npm (bundled with Node.js)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production build

```bash
npm run build
npm run start
```

`npm run lint` checks code quality with ESLint.

---

## Deploy to Vercel

1. Create a GitHub repository
2. Upload/push this project to GitHub
3. Log in to Vercel
4. Click **Add New → Project**
5. Import the GitHub repository
6. Keep **Framework Preset** as **Next.js**
7. Keep **Root Directory** as `./`
8. Click **Deploy**

No environment variables or configuration changes are needed. (Optional:
set `NEXT_PUBLIC_SITE_URL` to your final domain for exact SEO/Open-Graph URLs —
see `.env.example`.)

---

## Demo admin credentials

Sign in at **`/admin/login`** (the login screen shows tap-to-fill cards):

| Role        | Email                      | Password   | Access                                  |
| ----------- | -------------------------- | ---------- | --------------------------------------- |
| Admin/Owner | admin@vibefulhomes.demo    | `Demo@123` | Everything                              |
| Manager     | manager@vibefulhomes.demo  | `Demo@123` | Products, inventory, orders             |
| Order Staff | staff@vibefulhomes.demo    | `Demo@123` | Dashboard + order status updates        |

Role permissions are enforced in the UI **and at the route level** — typing a
restricted URL directly shows a "restricted" notice and safely redirects the
user back to the admin overview.

## Routes

### Storefront
| Route             | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| `/`               | Homepage — hero, categories, best sellers, reviews, store CTA |
| `/shop`           | Full catalog with filters, sorting and search  |
| `/product/[slug]` | Gallery, variants, quantity stepper, add to cart, direct WhatsApp order |
| `/cart`           | Quantity controls, remove, subtotal            |
| `/checkout`       | Validated form (Indian mobile/pincode) → order saved to localStorage → WhatsApp handoff |
| `/contact`        | Store info, call / WhatsApp / directions, enquiry form |

### Admin
`/admin/login`, `/admin` (overview), `/admin/products`, `/admin/inventory`,
`/admin/orders`, `/admin/staff` (Admin only), `/admin/settings`
(Admin only — includes **Reset Demo Data**).

---

## Changing the WhatsApp number

The demo WhatsApp number lives in **one central config file**:

```
src/lib/config.ts        → whatsapp: "919583833786"
```

Edit that value (digits only, international format, no `+`) and the
storefront header, mobile nav, floating button, footer, contact page and the
checkout order message all use it. The Admin → Settings page can also override
the number for the current browser; "Reset Demo Data" restores the config
default.

## How demo data works

- Seed data (12 products, 8 orders, 3 staff, settings, inventory history)
  loads **once**, only when localStorage is empty — refreshes never reset
  your changes.
- Checkout creates the order record in localStorage **before** opening
  `https://wa.me/<number>?text=<url-encoded message>` (full cart, customer
  details, order ID, subtotal, delivery note and order note).
- Checkout never reduces stock; stock is reduced only in the admin panel the
  first time an order moves *New Inquiry → Confirmed*.
- **Admin → Settings → Reset Demo Data** restores the original seed state.
- All product images are local files under `public/images/` — no external
  image hosts, nothing to break after deployment.

## Planned for a later production phase

- Manual product / inventory entry from the admin panel (beyond the current
  adjustment tools) and
- A real shared database replacing browser localStorage

Until then, this demo intentionally stays 100% client-side.
