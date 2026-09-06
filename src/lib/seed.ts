import type {
  ActivityEntry,
  InventoryAdjustment,
  Order,
  Product,
  StaffUser,
  StoreSettings,
} from "./types";
import { DEFAULT_SETTINGS } from "./format";

// ---------------------------------------------------------------------------
// SEED DATA — loaded once, only when localStorage is empty.
// To change the demo WhatsApp number, edit src/lib/config.ts (one central
// config). Product images are LOCAL files under public/images/ so the app
// is fully self-contained (works offline & on Vercel with zero external
// image hosts).
// ---------------------------------------------------------------------------

/** Local product photo, e.g. P("moon-lamp.jpg") → /images/products/moon-lamp.jpg */
const P = (name: string) => `/images/products/${name}`;
/** Local lifestyle photo, e.g. L("kitchen.jpg") → /images/lifestyle/kitchen.jpg */
const L = (name: string) => `/images/lifestyle/${name}`;

// Lifestyle images reused inside product galleries.
const LIVING = {
  kitchen: L("kitchen.jpg"),
  baking: L("baking.jpg"),
  cooking: L("cooking.jpg"),
  prep: L("prep.jpg"),
  workspace: L("workspace.jpg"),
  interior: L("interior.jpg"),
  boxes: L("boxes.jpg"),
  sink: L("sink.jpg"),
  bulb: L("bulb.jpg"),
  lampRoom: L("lamp-room.jpg"),
  plantTable: L("plant-table.jpg"),
  plantShelf: L("plant-shelf.jpg"),
  cozy: L("cozy.jpg"),
  laundry: L("laundry.png"),
};

const iso = (dayOffset: number, hour = 11, minute = 30) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const SEED_PRODUCTS: Product[] = [
  {
    id: "p01",
    slug: "digital-kitchen-weighing-scale",
    name: "Digital Kitchen Weighing Scale (White, Black)",
    category: "Kitchen",
    price: 699,
    mrp: 999,
    stock: 14,
    rating: 4.8,
    reviewCount: 36,
    badge: "Best Seller",
    shortDescription:
      "Precise 1 g–10 kg digital scale with tare function — perfect for baking, portioning and healthy cooking.",
    description:
      "A dependable digital weighing scale for everyday Indian kitchens. The high-precision sensor reads from 1 g up to 10 kg with a clear backlit LCD, so atta, dal, sugar and masala portions come out exact every time. Use the tare function to zero out bowls and weigh ingredients directly. The tempered glass top wipes clean in seconds, and the slim body slips into any drawer. Runs on standard AAA batteries (included), with auto shut-off to save power.",
    images: [P("kitchen-scale.jpg"), LIVING.kitchen, LIVING.baking],
    variants: { label: "Colour", options: ["White", "Black"] },
    sku: "VH-KIT-001",
    status: "Active",
    featured: true,
    createdAt: iso(-120),
  },
  {
    id: "p02",
    slug: "oil-dispenser-bottle-1000ml",
    name: "1000 ml Oil Dispenser Bottle",
    category: "Kitchen",
    price: 299,
    mrp: 449,
    stock: 22,
    rating: 4.6,
    reviewCount: 18,
    badge: null,
    shortDescription:
      "Leak-proof 1 L dispenser with a no-drip spout — keeps refilled oil, ghee or liquid masala neat on the counter.",
    description:
      "Refill and pour cooking oil without drips or spills. This 1000 ml dispenser pairs a sturdy food-grade body with a precision spout that controls flow, so the counter and gas stove stay grease-free between meals. The wide mouth makes refilling from a large store-bought pouch easy and mess-free, and the airtight cap keeps dust out. Equally handy for ghee, vinegar, liquid jaggery or dishwash liquid at the sink.",
    images: [P("oil-dispenser.jpg"), LIVING.prep, LIVING.cooking],
    variants: null,
    sku: "VH-KIT-002",
    status: "Active",
    featured: false,
    createdAt: iso(-110),
  },
  {
    id: "p03",
    slug: "12-in-1-vegetable-chopper",
    name: "12-in-1 Vegetable Chopper",
    category: "Kitchen",
    price: 549,
    mrp: 799,
    stock: 8,
    rating: 4.7,
    reviewCount: 51,
    badge: "Popular",
    shortDescription:
      "Chop, dice, slice and julienne in seconds with 12 interchangeable blades and a collecting tray.",
    description:
      "Cut vegetable prep time in half. This 12-in-1 chopper set includes everything needed for daily Indian cooking — dicer blades for onions and tomatoes, slicers for cucumber and salad, julienne strips for carrots and beans, plus a egg separator, peeler and safety glove. The non-slip base keeps the container steady while the push lid does the work, and everything drops straight into the 1.2 L collecting tray, so the chopping board (and your eyes) stay tear-free. Blades detach for easy washing.",
    images: [P("vegetable-chopper.jpg"), LIVING.cooking, LIVING.kitchen],
    variants: null,
    sku: "VH-KIT-003",
    status: "Active",
    featured: true,
    createdAt: iso(-100),
  },
  {
    id: "p04",
    slug: "airtight-container-set-of-6",
    name: "Airtight Container Set of 6",
    category: "Kitchen",
    price: 799,
    mrp: 1199,
    stock: 11,
    rating: 4.5,
    reviewCount: 27,
    badge: null,
    shortDescription:
      "Six stackable airtight boxes in three sizes — keep atta, dal, sugar and masala fresh and pest-free.",
    description:
      "A complete storage set that turns a cluttered kitchen shelf into an organised pantry. Six containers in 1500 ml, 1000 ml and 500 ml sizes with silicone-sealed lids lock in freshness and keep moisture, dust and ants away from staples. The transparent bodies show contents at a glance, the rectangular shapes stack neatly, and they are safe for the fridge, microwave (reheating) and dishwasher. Ideal for atta, rice, dal, sugar, tea, coffee, spices, dry fruits and namkeen.",
    images: [P("airtight-containers.jpg"), LIVING.sink, LIVING.kitchen],
    variants: null,
    sku: "VH-KIT-004",
    status: "Active",
    featured: false,
    createdAt: iso(-95),
  },
  {
    id: "p05",
    slug: "multipurpose-wall-hook-set",
    name: "Multipurpose Wall Hook Set",
    category: "Home Utility",
    price: 199,
    mrp: 299,
    stock: 30,
    rating: 4.4,
    reviewCount: 14,
    badge: null,
    shortDescription:
      "Strong self-adhesive hooks that hold keys, towels, hats and kitchen tools — no drilling needed.",
    description:
      "Add hanging space anywhere in minutes. This set of rust-resistant multipurpose hooks mounts with a strong adhesive backing that grips tiles, painted walls, wood and metal — no drill, no wall damage. Each hook holds everyday items like towels, aprons, keys, caps, shopping bags, mops and kitchen tools. The minimal design blends into bathrooms, kitchens, entryways and hostel rooms. Position once, press firmly, and it is ready to use.",
    images: [P("wall-hooks.jpg"), LIVING.workspace, LIVING.interior],
    variants: null,
    sku: "VH-UTL-005",
    status: "Active",
    featured: false,
    createdAt: iso(-90),
  },
  {
    id: "p06",
    slug: "cleaning-brush-set-of-3",
    name: "Cleaning Brush Set of 3",
    category: "Home Utility",
    price: 249,
    mrp: 399,
    stock: 19,
    rating: 4.5,
    reviewCount: 23,
    badge: null,
    shortDescription:
      "Three purpose-built brushes — bottle, dish and corner scrubber — for a genuinely cleaner kitchen.",
    description:
      "The right brush makes cleaning faster. This three-piece set covers the jobs a sponge cannot: a long-handled bottle brush that reaches the bottom of water bottles and narrow jars, a stiff-bristle dish brush for stuck masala and burnt kadhais, and a small detail brush for taps, sink corners, tile grout and kitchen hob gaps. Comfortable non-slip handles, hanging holes for drying, and bristles that do not scratch steel or ceramic.",
    images: [P("brush-set.jpg"), LIVING.laundry, LIVING.sink],
    variants: null,
    sku: "VH-UTL-006",
    status: "Active",
    featured: false,
    createdAt: iso(-85),
  },
  {
    id: "p07",
    slug: "rechargeable-led-emergency-light",
    name: "Rechargeable LED Emergency Light",
    category: "Home Utility",
    price: 649,
    mrp: 899,
    stock: 5,
    rating: 4.6,
    reviewCount: 31,
    badge: "Low Stock",
    shortDescription:
      "Bright rechargeable light with 4–6 hours backup — stays ready for power cuts, charges by USB.",
    description:
      "Be ready for every power cut. This rechargeable emergency light packs bright, evenly spread LED lighting into a portable body with a 2000 mAh battery that delivers 4–6 hours of backup on a full charge. Three brightness modes let you stretch backup through long evenings, and the built-in handle hangs from a hook, stands on the study table or travels to the terrace. Charging is simple with the included USB cable, and the indicator shows charge status at a glance. An essential for every Odisha home.",
    images: [P("emergency-light.jpg"), LIVING.bulb, LIVING.lampRoom],
    variants: null,
    sku: "VH-UTL-007",
    status: "Active",
    featured: false,
    createdAt: iso(-80),
  },
  {
    id: "p08",
    slug: "foldable-clothes-storage-organiser",
    name: "Foldable Clothes Storage Organiser (Grey, Beige)",
    category: "Storage & Organisers",
    price: 399,
    mrp: 599,
    stock: 16,
    rating: 4.5,
    reviewCount: 22,
    badge: null,
    shortDescription:
      "Collapsible fabric organiser with divider slots — neatly store clothes, sarees, kids' wear and linens.",
    description:
      "Tame overflowing cupboards and lofts. This foldable storage organiser holds folded clothes, sarees, towels, kids' outfits and bed linens in neat divider slots, so nothing disappears at the back of the shelf. The breathable non-woven fabric protects garments from dust, the reinforced base keeps its shape when full, and sturdy side handles let you slide it out of a wardrobe or loft in one pull. When not needed, the whole box folds flat. Available in Grey and Beige.",
    images: [P("clothes-organiser.jpg"), LIVING.boxes, LIVING.sink],
    variants: { label: "Colour", options: ["Grey", "Beige"] },
    sku: "VH-STR-008",
    status: "Active",
    featured: false,
    createdAt: iso(-75),
  },
  {
    id: "p09",
    slug: "shoe-rack-organiser",
    name: "Shoe Rack Organiser",
    category: "Storage & Organisers",
    price: 899,
    mrp: 1299,
    stock: 7,
    rating: 4.7,
    reviewCount: 19,
    badge: null,
    shortDescription:
      "Sturdy multi-tier rack that clears the entryway — holds the whole family's footwear in one spot.",
    description:
      "Give every chappal, sneaker and school shoe a home. This multi-tier shoe rack assembles in minutes without tools and holds up to 12–15 pairs across ventilated shelves that let footwear breathe and dry. The powder-coated frame resists rust from monsoon dampness, and each tier wipes clean easily. Compact enough for the entryway, balcony or corridor, it ends the daily hunt for the matching shoe. Non-woven side pockets keep brushes, polish and small items handy.",
    images: [P("shoe-rack.jpg"), LIVING.interior, LIVING.workspace],
    variants: null,
    sku: "VH-STR-009",
    status: "Active",
    featured: true,
    createdAt: iso(-70),
  },
  {
    id: "p10",
    slug: "multipurpose-drawer-divider-set",
    name: "Multipurpose Drawer Divider Set",
    category: "Storage & Organisers",
    price: 329,
    mrp: 499,
    stock: 24,
    rating: 4.3,
    reviewCount: 12,
    badge: null,
    shortDescription:
      "Snap-fit dividers that split any drawer into neat cells for socks, innerwear, stationery and tools.",
    description:
      "Turn a jumbled drawer into tidy grid. This divider set clicks together in endless combinations to fit drawers of different sizes, creating separate cells for socks, innerwear, handkerchiefs, dupattas, stationery, chargers, medicines or toolbox bits. The smooth plastic edges are fabric-friendly, the white finish looks clean inside wardrobes and desks, and the sections can be re-arranged whenever needs change. One of those small upgrades that makes every morning a little calmer.",
    images: [P("drawer-divider.jpg"), LIVING.boxes, LIVING.workspace],
    variants: null,
    sku: "VH-STR-010",
    status: "Active",
    featured: false,
    createdAt: iso(-65),
  },
  {
    id: "p11",
    slug: "led-moon-lamp",
    name: "LED Moon Lamp",
    category: "Home Décor",
    price: 499,
    mrp: 749,
    stock: 10,
    rating: 4.8,
    reviewCount: 42,
    badge: "New Arrival",
    shortDescription:
      "A glowing 3D moon with adjustable warm-white light — the softest night lamp for kids and bedrooms.",
    description:
      "Moonlight, indoors. This 3D-printed moon lamp recreates the real lunar surface with soft, adjustable lighting — dim it to a night glow or brighten it for reading. The rechargeable body sits on a neat wooden stand by the bed, study table or mandir, and children love it as a gentle night light that is safe to touch. A beautiful gift for birthdays and housewarmings, and a calming presence in any room. USB rechargeable with 8+ hours of soft light per charge.",
    images: [P("moon-lamp.jpg"), LIVING.bulb, LIVING.cozy],
    variants: null,
    sku: "VH-DEC-011",
    status: "Active",
    featured: true,
    createdAt: iso(-14),
  },
  {
    id: "p12",
    slug: "artificial-plant-pot-set",
    name: "Artificial Plant Pot Set",
    category: "Home Décor",
    price: 599,
    mrp: 899,
    stock: 13,
    rating: 4.6,
    reviewCount: 25,
    badge: null,
    shortDescription:
      "Set of realistic mini plants in white pots — instant greenery for shelves, tables and entryways.",
    description:
      "Fresh green corners without the watering can. This set of artificial plants looks convincingly real — variegated leaves, natural stems and clean white ceramic-look pots — and instantly softens shelves, side tables, bathroom counters, reception desks and entryway consoles. UV-stable leaves keep their colour near windows, and a quick dust is all the care they ever need. Style them in a row, in pairs, or scatter singly for a lived-in, welcoming home.",
    images: [P("plant-set.jpg"), LIVING.plantTable, LIVING.plantShelf],
    variants: null,
    sku: "VH-DEC-012",
    status: "Active",
    featured: false,
    createdAt: iso(-7),
  },
];

export const SEED_STAFF: StaffUser[] = [
  {
    id: "s01",
    name: "Sanjay Patra",
    email: "admin@vibefulhomes.demo",
    password: "Demo@123",
    role: "Admin",
    active: true,
    lastLogin: iso(-1, 9, 45),
    createdAt: iso(-150),
  },
  {
    id: "s02",
    name: "Deepa Rao",
    email: "manager@vibefulhomes.demo",
    password: "Demo@123",
    role: "Manager",
    active: true,
    lastLogin: iso(-2, 10, 15),
    createdAt: iso(-120),
  },
  {
    id: "s03",
    name: "Manoj Sahoo",
    email: "staff@vibefulhomes.demo",
    password: "Demo@123",
    role: "Order Staff",
    active: true,
    lastLogin: iso(-1, 17, 5),
    createdAt: iso(-90),
  },
];

// --- Seeded orders: 8 realistic WhatsApp inquiries across recent dates ------

const cust = (
  name: string,
  mobile: string,
  address: string,
  city: string,
  pincode: string,
  note = ""
) => ({ name, mobile, address, city, pincode, note });

const item = (
  productId: string,
  name: string,
  qty: number,
  price: number,
  variant: string | null = null
) => ({
  productId,
  name,
  variant,
  qty,
  price,
  lineTotal: qty * price,
});

const evt = (status: Order["status"], dayOffset: number, hour: number, by: string, note?: string) => ({
  status,
  timestamp: iso(dayOffset, hour, 20),
  by,
  note,
});

export const SEED_ORDERS: Order[] = [
  {
    id: "VH-20260828-1001",
    createdAt: iso(-9, 10, 12),
    customer: cust(
      "Priya Sharma",
      "9437012856",
      "Plot 24, Sector 6, CDA",
      "Cuttack",
      "753014",
      "Please call before delivery."
    ),
    items: [item("p11", "LED Moon Lamp", 1, 499), item("p12", "Artificial Plant Pot Set", 1, 599)],
    subtotal: 1098,
    status: "Delivered",
    paymentStatus: "Paid",
    assignedStaff: "s03",
    stockReduced: true,
    timeline: [
      evt("New Inquiry", -9, 10, "Customer (WhatsApp)"),
      evt("Confirmed", -9, 13, "Deepa Rao", "Stock reduced on confirmation."),
      evt("Packed", -8, 11, "Manoj Sahoo"),
      evt("Shipped", -8, 18, "Manoj Sahoo", "Handed to local delivery partner."),
      evt("Delivered", -7, 12, "Manoj Sahoo", "Customer confirmed receipt."),
    ],
    internalNotes: "Regular customer — second order this month.",
  },
  {
    id: "VH-20260901-1002",
    createdAt: iso(-5, 16, 40),
    customer: cust(
      "Rahul Kumar",
      "9778745120",
      "B-102, Bidanasi Housing Board",
      "Cuttack",
      "753016",
      ""
    ),
    items: [
      item("p01", "Digital Kitchen Weighing Scale", 1, 699, "White"),
      item("p03", "12-in-1 Vegetable Chopper", 1, 549),
    ],
    subtotal: 1248,
    status: "Shipped",
    paymentStatus: "Paid",
    assignedStaff: "s02",
    stockReduced: true,
    timeline: [
      evt("New Inquiry", -5, 16, "Customer (WhatsApp)"),
      evt("Confirmed", -5, 17, "Deepa Rao", "Stock reduced on confirmation."),
      evt("Packed", -4, 10, "Deepa Rao"),
      evt("Shipped", -4, 15, "Deepa Rao"),
    ],
    internalNotes: "",
  },
  {
    id: "VH-20260902-1003",
    createdAt: iso(-4, 11, 25),
    customer: cust(
      "Sneha Mohanty",
      "9078954632",
      "Quarter 2/408, Sutahat",
      "Cuttack",
      "753001",
      "Gift wrap if possible"
    ),
    items: [item("p04", "Airtight Container Set of 6", 2, 799)],
    subtotal: 1598,
    status: "Packed",
    paymentStatus: "Pending",
    assignedStaff: "s02",
    stockReduced: true,
    timeline: [
      evt("New Inquiry", -4, 11, "Customer (WhatsApp)"),
      evt("Confirmed", -4, 12, "Deepa Rao", "Stock reduced on confirmation."),
      evt("Packed", -3, 14, "Manoj Sahoo"),
    ],
    internalNotes: "Add a thank-you card — housewarming gift.",
  },
  {
    id: "VH-20260903-1004",
    createdAt: iso(-3, 9, 55),
    customer: cust(
      "Bikash Panda",
      "9937658421",
      "Near Kadam Rasul, Mundali",
      "Cuttack",
      "754202",
      ""
    ),
    items: [item("p09", "Shoe Rack Organiser", 1, 899)],
    subtotal: 899,
    status: "Confirmed",
    paymentStatus: "Pending",
    assignedStaff: "s03",
    stockReduced: false,
    timeline: [
      evt("New Inquiry", -3, 9, "Customer (WhatsApp)"),
      evt("Confirmed", -3, 12, "Manoj Sahoo"),
    ],
    internalNotes: "Availability of the shoe rack to be rechecked before packing.",
  },
  {
    id: "VH-20260904-1005",
    createdAt: iso(-2, 15, 10),
    customer: cust(
      "Anita Das",
      "9438710265",
      "Ward 12, Buxi Bazar",
      "Cuttack",
      "753001",
      "Evening delivery preferred after 6 PM."
    ),
    items: [
      item("p06", "Cleaning Brush Set of 3", 1, 249),
      item("p05", "Multipurpose Wall Hook Set", 2, 199),
    ],
    subtotal: 647,
    status: "New Inquiry",
    paymentStatus: "Pending",
    assignedStaff: null,
    stockReduced: false,
    timeline: [evt("New Inquiry", -2, 15, "Customer (WhatsApp)")],
    internalNotes: "",
  },
  {
    id: "VH-20260904-1006",
    createdAt: iso(-2, 12, 8),
    customer: cust(
      "Rakesh Sahoo",
      "9040531728",
      "Plot 7, Sector 1, Markat Nagar",
      "Cuttack",
      "753014",
      ""
    ),
    items: [item("p08", "Foldable Clothes Storage Organiser", 1, 399, "Grey")],
    subtotal: 399,
    status: "Cancelled",
    paymentStatus: "Refunded",
    assignedStaff: "s02",
    stockReduced: false,
    timeline: [
      evt("New Inquiry", -2, 12, "Customer (WhatsApp)"),
      evt("Cancelled", -1, 10, "Deepa Rao", "Customer ordered the wrong colour; refund initiated."),
    ],
    internalNotes: "Refund sent via UPI on 05 Sep.",
  },
  {
    id: "VH-20260905-1007",
    createdAt: iso(-1, 17, 35),
    customer: cust(
      "Meera Patra",
      "9447651238",
      "Nuapatna, Tulasipur",
      "Cuttack",
      "753008",
      ""
    ),
    items: [
      item("p11", "LED Moon Lamp", 2, 499),
      item("p10", "Multipurpose Drawer Divider Set", 1, 329),
    ],
    subtotal: 1327,
    status: "Delivered",
    paymentStatus: "Paid",
    assignedStaff: "s03",
    stockReduced: true,
    timeline: [
      evt("New Inquiry", -1, 17, "Customer (WhatsApp)"),
      evt("Confirmed", -1, 18, "Manoj Sahoo", "Stock reduced on confirmation."),
      evt("Packed", -1, 19, "Manoj Sahoo"),
      evt("Shipped", 0, 9, "Manoj Sahoo"),
      evt("Delivered", 0, 11, "Manoj Sahoo"),
    ],
    internalNotes: "Both moon lamps were for gifting.",
  },
  {
    id: "VH-20260906-1008",
    createdAt: iso(0, 10, 5),
    customer: cust(
      "Suresh Mishra",
      "9776841523",
      "Choudhury Bazar, Near Baji Rout Chhak",
      "Cuttack",
      "753001",
      "Please share delivery charge first."
    ),
    items: [
      item("p07", "Rechargeable LED Emergency Light", 1, 649),
      item("p02", "1000 ml Oil Dispenser Bottle", 1, 299),
    ],
    subtotal: 948,
    status: "New Inquiry",
    paymentStatus: "Pending",
    assignedStaff: null,
    stockReduced: false,
    timeline: [evt("New Inquiry", 0, 10, "Customer (WhatsApp)")],
    internalNotes: "",
  },
];

export const SEED_ACTIVITY: ActivityEntry[] = [
  {
    id: "a01",
    timestamp: iso(-2, 12, 40),
    actor: "Sanjay Patra",
    action: "Updated Digital Kitchen Weighing Scale stock from 18 to 14",
  },
  {
    id: "a02",
    timestamp: iso(-2, 13, 5),
    actor: "Deepa Rao",
    action: "Confirmed order VH-20260901-1002 and reduced stock",
  },
  {
    id: "a03",
    timestamp: iso(-1, 10, 20),
    actor: "Deepa Rao",
    action: "Cancelled order VH-20260904-1006 — refund initiated",
  },
  {
    id: "a04",
    timestamp: iso(-1, 9, 10),
    actor: "Deepa Rao",
    action: "Updated Rechargeable LED Emergency Light stock from 8 to 5",
  },
  {
    id: "a05",
    timestamp: iso(-1, 18, 5),
    actor: "Manoj Sahoo",
    action: "Packed order VH-20260905-1007",
  },
  {
    id: "a06",
    timestamp: iso(0, 9, 50),
    actor: "Sanjay Patra",
    action: "Updated Multipurpose Drawer Divider Set stock from 18 to 24",
  },
];

export const SEED_ADJUSTMENTS: InventoryAdjustment[] = [
  {
    id: "adj01",
    productId: "p01",
    productName: "Digital Kitchen Weighing Scale (White, Black)",
    type: "Decrease",
    qty: 4,
    reason: "Order adjustment",
    before: 18,
    after: 14,
    by: "Sanjay Patra",
    timestamp: iso(-2, 12, 40),
  },
  {
    id: "adj02",
    productId: "p07",
    productName: "Rechargeable LED Emergency Light",
    type: "Decrease",
    qty: 3,
    reason: "Damage",
    before: 8,
    after: 5,
    by: "Deepa Rao",
    timestamp: iso(-1, 9, 10),
  },
  {
    id: "adj03",
    productId: "p10",
    productName: "Multipurpose Drawer Divider Set",
    type: "Increase",
    qty: 6,
    reason: "Purchase received",
    before: 18,
    after: 24,
    by: "Sanjay Patra",
    timestamp: iso(0, 9, 50),
  },
];

export const SEED_SETTINGS: StoreSettings = { ...DEFAULT_SETTINGS };

/** Category card images for the homepage (local files). */
export const CATEGORY_IMAGES: Record<string, string> = {
  Kitchen: LIVING.kitchen,
  "Home Utility": LIVING.laundry,
  "Storage & Organisers": LIVING.boxes,
  "Home Décor": LIVING.cozy,
};

/** Hero side visual: curated collage (local file). */
export const HERO_IMAGE = "/images/hero.jpg";
