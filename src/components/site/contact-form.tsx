"use client";

import { useState } from "react";
import { PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Locale } from "@/lib/i18n";

export interface ContactFormCopy {
  formTitle: string;
  formText: string;
  yourName: string;
  namePlaceholder: string;
  phone: string;
  submit: string;
  sending: string;
  privacy: string;
  errFields: string;
  errPhone: string;
  success: string;
}

export function ContactForm({
  copy,
  locale,
}: {
  copy: ContactFormCopy;
  locale: Locale;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  const showToast = (kind: "error" | "success", title: string, description?: string) => {
    window.dispatchEvent(new Event("crafo:toast"));
    void import("sonner").then(({ toast }) => {
      if (kind === "error") {
        toast.error(title);
      } else {
        toast.success(title, description ? { description } : undefined);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast("error", copy.errFields);
      return;
    }
    if (!/^[+0-9\s()\-]{10,18}$/.test(phone.trim())) {
      showToast("error", copy.errPhone);
      return;
    }
    const cleanName = name.trim();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setName("");
      setPhone("");
      const desc =
        locale === "uk"
          ? `${cleanName}, напишемо вам у Viber або Telegram протягом 15 хвилин.`
          : `${cleanName}, напишем вам в Viber или Telegram в течение 15 минут.`;
      showToast("success", copy.success, desc);
    }, 900);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" aria-label={copy.formTitle}>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-400">
        <PhoneCall className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-display text-3xl font-bold">{copy.formTitle}</h3>
      <p className="mt-2.5 leading-relaxed text-cream/70">{copy.formText}</p>
      <div className="mt-7 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="callback-name" className="text-cream/85">
            {copy.yourName}
          </Label>
          <Input
            id="callback-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.namePlaceholder}
            maxLength={50}
            className="h-12 rounded-xl border-white/15 bg-white/[0.06] text-cream placeholder:text-cream/40 focus-visible:ring-gold-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="callback-phone" className="text-cream/85">
            {copy.phone}
          </Label>
          <Input
            id="callback-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+380 (__) ___-__-__"
            maxLength={18}
            className="h-12 rounded-xl border-white/15 bg-white/[0.06] text-cream placeholder:text-cream/40 focus-visible:ring-gold-500"
          />
        </div>
        <Button
          type="submit"
          disabled={sending}
          className="btn-gold-luxe h-13 w-full rounded-full py-3.5 text-base font-bold disabled:opacity-60"
        >
          {sending ? copy.sending : copy.submit}
        </Button>
        <p className="text-center text-xs leading-relaxed text-cream/50">{copy.privacy}</p>
      </div>
    </form>
  );
}
