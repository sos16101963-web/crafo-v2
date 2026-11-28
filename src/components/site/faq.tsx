import { ChevronDown } from "lucide-react";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function Faq({ locale }: { locale: Locale }) {
  const t = getDict(locale).faq;
  return (
    <section id="faq" className="bg-cream-100 py-20 lg:py-28" aria-label={t.aria}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="divider-gold text-[13px] font-semibold uppercase tracking-[0.3em] text-gold-700">{t.kicker}</p>
          <h2 className="mt-4 font-display text-4xl font-bold text-choco-900 sm:text-5xl">{t.h2}</h2>
          <p className="mt-4 text-lg leading-relaxed text-choco-600">{t.sub}</p>
        </div>

        <div className="mt-12 space-y-3.5">
          {t.items.map((f: { q: string; a: string }, i: number) => (
            <details
              key={i}
              name="faq"
              className="group rounded-2xl border border-border bg-white/85 px-6 shadow-sm open:border-gold-500/50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-display text-lg font-bold text-choco-900 hover:text-choco-700 [&::-webkit-details-marker]:hidden">
                <span>{f.q}</span>
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-choco-500 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="pb-6 text-[15px] leading-relaxed text-choco-600">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
