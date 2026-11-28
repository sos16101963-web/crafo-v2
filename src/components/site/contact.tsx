import { Clock, MapPin, MessageCircle, Phone, Send, Youtube } from "lucide-react";
import { site } from "@/lib/site";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { TikTokIcon } from "@/components/site/icons";
import { TrackedLink } from "./tracked-link";
import { ContactForm } from "./contact-form";

const messengerIcons = {
  Viber: MessageCircle,
  WhatsApp: Phone,
  Telegram: Send,
} as const;

const messengerColors: Record<string, string> = {
  Viber: "text-[#a78bfa] group-hover:bg-[#6f5df1] group-hover:text-white",
  WhatsApp: "text-[#4ade80] group-hover:bg-[#118159] group-hover:text-white",
  Telegram: "text-[#60a5fa] group-hover:bg-[#197cae] group-hover:text-white",
};

export function ContactCta({ locale }: { locale: Locale }) {
  const t = getDict(locale).contacts;

  return (
    <section id="contacts" className="scroll-mt-20 bg-cream py-20 lg:py-28" aria-label={t.aria}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-choco-950 text-cream shadow-2xl">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="texture-cocoa p-8 sm:p-12 lg:p-14">
              <p className="divider-gold text-[13px] font-semibold uppercase tracking-[0.3em] text-gold-400">
                {t.kicker}
              </p>
              <h2 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
                {t.h2a} <span className="gold-text">{t.h2b}</span>
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-cream/75">
                {t.sub}
              </p>

              <address className="mt-9 grid gap-4 not-italic">
                {site.messengers.map((m) => {
                  const Icon = messengerIcons[m.name as keyof typeof messengerIcons];
                  return (
                    <TrackedLink
                      key={m.name}
                      href={m.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      eventName="contact_click"
                      eventParams={{ channel: m.name }}
                      className="group flex items-center gap-4"
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] transition-colors ${
                          messengerColors[m.name]
                        }`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm text-cream/60">{m.name}</span>
                        <span className="font-bold text-cream group-hover:text-gold-300">{m.hint}</span>
                      </span>
                    </TrackedLink>
                  );
                })}
                <TrackedLink
                  href={site.phoneHref}
                  eventName="contact_click"
                  eventParams={{ channel: "phone" }}
                  className="group flex items-center gap-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-gold-400 transition-colors group-hover:bg-gold-500 group-hover:text-choco-950">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-cream/60">{t.call}</span>
                    <span className="font-bold text-cream group-hover:text-gold-300">{site.phoneShort}</span>
                  </span>
                </TrackedLink>
                <TrackedLink
                  href={site.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  eventName="contact_click"
                  eventParams={{ channel: "youtube" }}
                  className="group flex items-center gap-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[#f87171] transition-colors group-hover:bg-[#ff0000] group-hover:text-white">
                    <Youtube className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-cream/60">YouTube</span>
                    <span className="font-bold text-cream group-hover:text-gold-300">@craft.choco.kharkiv</span>
                  </span>
                </TrackedLink>
                <TrackedLink
                  href={site.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  eventName="contact_click"
                  eventParams={{ channel: "tiktok" }}
                  className="group flex items-center gap-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[#22d3ee] transition-colors group-hover:bg-black group-hover:text-white">
                    <TikTokIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-cream/60">TikTok</span>
                    <span className="font-bold text-cream group-hover:text-gold-300">@aleksandr_mag_</span>
                  </span>
                </TrackedLink>
                <a
                  href={site.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 transition-colors"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-gold-400 transition-colors group-hover:bg-gold-500 group-hover:text-choco-950">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-cream/60">{t.where}</span>
                    <span className="font-bold text-cream group-hover:text-gold-300">{t.whereValue}</span>
                  </span>
                </a>
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-gold-400">
                    <Clock className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-cream/60">{t.online}</span>
                    <span className="font-bold text-cream">{t.onlineValue}</span>
                  </span>
                </div>
              </address>
            </div>

            <div className="flex items-center border-t border-white/10 bg-white/[0.03] p-8 sm:p-12 lg:border-l lg:border-t-0">
              <ContactForm
                locale={locale}
                copy={{
                  formTitle: t.formTitle,
                  formText: t.formText,
                  yourName: t.yourName,
                  namePlaceholder: t.namePlaceholder,
                  phone: t.phone,
                  submit: t.submit,
                  sending: t.sending,
                  privacy: t.privacy,
                  errFields: t.errFields,
                  errPhone: t.errPhone,
                  success: t.success,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
