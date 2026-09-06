"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Phone,
  MessageCircle,
  Compass,
  Clock,
  Send,
  Navigation,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/lib/store";
import {
  buildEnquiryMessage,
  isValidIndianMobile,
  mapsLink,
  telLink,
  waLink,
} from "@/lib/format";

export function ContactClient() {
  const settings = useSettings();
  const [form, setForm] = useState({ name: "", mobile: "", message: "" });
  const [errors, setErrors] = useState<{
    name?: string;
    mobile?: string;
    message?: string;
  }>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (form.name.trim().length < 3) next.name = "Please enter your name.";
    if (!isValidIndianMobile(form.mobile))
      next.mobile = "Enter a valid 10-digit Indian mobile number.";
    if (form.message.trim().length < 5)
      next.message = "Please write a short message so we can help.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please check the highlighted fields");
      return;
    }
    const href = waLink(
      settings.whatsapp,
      buildEnquiryMessage(form.name.trim(), form.mobile, form.message)
    );
    window.open(href, "_blank", "noopener,noreferrer");
    toast.success("Enquiry ready", {
      description: "Tap Send inside WhatsApp so it reaches the store.",
    });
    setForm({ name: "", mobile: "", message: "" });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
          Contact & store visit
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Come say hello — or message us on WhatsApp.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          We are a small neighbourhood store in Sutahat, Cuttack. Call ahead
          to check stock, message for suggestions, or drop by to see the
          products in person.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        {/* Store info */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-7">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold">
              <Home className="h-5 w-5 text-primary" aria-hidden />
              {settings.businessName}
            </h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" aria-hidden />
                <span className="leading-relaxed text-muted-foreground">
                  {settings.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4.5 w-4.5 shrink-0 text-primary" aria-hidden />
                <a
                  href={telLink(settings.phone)}
                  className="font-semibold text-foreground hover:text-primary"
                >
                  {settings.phone}
                </a>
                <span className="text-muted-foreground/70">· calls & WhatsApp</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4.5 w-4.5 shrink-0 text-primary" aria-hidden />
                <span className="text-success">{settings.hours}</span>
              </li>
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-full bg-primary hover:bg-plum-soft"
              >
                <a href={telLink(settings.phone)}>
                  <Phone className="h-4 w-4" aria-hidden /> Call Store
                </a>
              </Button>
              <Button
                asChild
                className="rounded-full bg-[#1e9e4b] hover:bg-[#178a41]"
              >
                <a
                  href={waLink(
                    settings.whatsapp,
                    "Hello Vibeful Homes, I have a question."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full"
              >
                <a
                  href={mapsLink(settings.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Compass className="h-4 w-4" aria-hidden /> Get Directions
                </a>
              </Button>
            </div>
          </div>

          {/* Simple map card (no paid Maps API) */}
          <a
            href={mapsLink(settings.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block h-52 overflow-hidden rounded-3xl border border-border bg-secondary/50 shadow-sm"
            aria-label="Open our location in Google Maps"
          >
            {/* Decorative "map" grid */}
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(to_right,#e9e2da_1px,transparent_1px),linear-gradient(to_bottom,#e9e2da_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]"
            />
            <div
              aria-hidden
              className="absolute left-[18%] top-[12%] h-[70%] w-[8%] -rotate-[28deg] rounded-full bg-accent/70"
            />
            <div
              aria-hidden
              className="absolute right-[12%] top-[58%] h-[6%] w-[65%] -rotate-[14deg] rounded-full bg-accent/60"
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
              <span className="relative flex h-12 w-12 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/25" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <MapPin className="h-6 w-6" aria-hidden />
                </span>
              </span>
            </div>
            <div className="absolute bottom-4 left-4 rounded-2xl bg-white/95 px-4 py-2.5 shadow-md">
              <p className="text-sm font-bold">Vibeful Homes</p>
              <p className="text-xs text-muted-foreground">
                Sutahat, Cuttack — tap to open in Maps
              </p>
            </div>
            <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow transition-transform group-hover:scale-110">
              <Navigation className="h-4.5 w-4.5" aria-hidden />
            </span>
          </a>
        </div>

        {/* Enquiry form */}
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-base font-bold">Send an enquiry</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your message opens directly in WhatsApp — just tap Send there.
          </p>
          <form onSubmit={submit} noValidate className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="c-name">Your name *</Label>
                <Input
                  id="c-name"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    setErrors((er) => ({ ...er, name: undefined }));
                  }}
                  placeholder="e.g. Anita Das"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  className={errors.name ? "border-danger" : ""}
                />
                {errors.name && (
                  <p className="text-xs font-medium text-danger" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-mobile">Mobile number *</Label>
                <Input
                  id="c-mobile"
                  value={form.mobile}
                  onChange={(e) => {
                    setForm((f) => ({
                      ...f,
                      mobile: e.target.value.replace(/[^\d\s-]/g, ""),
                    }));
                    setErrors((er) => ({ ...er, mobile: undefined }));
                  }}
                  placeholder="10-digit number"
                  inputMode="numeric"
                  autoComplete="tel"
                  aria-invalid={!!errors.mobile}
                  className={errors.mobile ? "border-danger" : ""}
                />
                {errors.mobile && (
                  <p className="text-xs font-medium text-danger" role="alert">
                    {errors.mobile}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-message">Message *</Label>
              <Textarea
                id="c-message"
                value={form.message}
                onChange={(e) => {
                  setForm((f) => ({ ...f, message: e.target.value }));
                  setErrors((er) => ({ ...er, message: undefined }));
                }}
                placeholder="Ask about a product, stock availability, bulk orders…"
                rows={5}
                aria-invalid={!!errors.message}
                className={errors.message ? "border-danger" : ""}
              />
              {errors.message && (
                <p className="text-xs font-medium text-danger" role="alert">
                  {errors.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full bg-[#1e9e4b] text-base hover:bg-[#178a41]"
            >
              <Send className="h-5 w-5" aria-hidden />
              Send via WhatsApp
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Opens WhatsApp with your message pre-filled — nothing is sent
              until you tap Send.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}