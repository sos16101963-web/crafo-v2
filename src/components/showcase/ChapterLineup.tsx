"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { FLAVORS, SHOWCASE_COPY, type FlavorSpec } from "@/lib/showcase/content";
import { productPath } from "@/lib/slugs";
import { soundEngine } from "@/lib/showcase/soundEngine";
import { useCart } from "@/store/cart";

const FLAVOR_TO_SET_ID: Record<FlavorSpec["id"], string> = {
  passion: "set-sixteen",
  raspberry: "set-twelve",
  pistachio: "set-nine",
  truffle: "set-six",
};

export const ChapterLineup: React.FC<{ locale: Locale }> = ({ locale }) => {
  const addItem = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);

  return (
    <section
      id="lineup"
      className="relative bg-black py-24 sm:py-32 px-6 sm:px-12 lg:px-20 border-t border-white/10"
    >
      <div className="max-w-[1360px] mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="font-mono-tech text-[11px] tracking-[0.26em] text-[#e7b866]/85 uppercase mb-3">
            {SHOWCASE_COPY.lineup.kicker[locale]}
          </p>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.02]">
            {SHOWCASE_COPY.lineup.heading[locale]}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {FLAVORS.map((flv) => {
            const setId = FLAVOR_TO_SET_ID[flv.id];
            const href = productPath(setId, locale);
            return (
              <article
                key={flv.id}
                className="group flex flex-col rounded-3xl overflow-hidden border border-white/12 bg-[#070709] hover:border-[#e7b866]/55 transition-all duration-300"
              >
                <Link href={href} className="relative aspect-[16/10] bg-black overflow-hidden block">
                  <img
                    src={flv.plate}
                    alt={flv.name[locale]}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span
                    className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full font-mono-tech text-[10px] bg-black/75 border border-white/15"
                    style={{ color: flv.accentHex }}
                  >
                    {flv.cocoaPct}
                  </span>
                </Link>
                <div className="p-5 flex flex-1 flex-col">
                  <Link href={href} className="no-underline">
                    <h3 className="text-xl font-semibold text-white group-hover:text-[#fff3ce] transition-colors m-0">
                      {flv.name[locale]}
                    </h3>
                  </Link>
                  <p className="font-display italic text-sm text-[#f3d28e] mt-1 mb-3">
                    {flv.subtitle[locale]}
                  </p>
                  <p className="text-xs text-white/60 leading-relaxed m-0 flex-1">
                    {flv.fillingArchitecture[locale]}
                  </p>

                  <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
                    <Link
                      href={href}
                      className="inline-flex items-center gap-1 font-mono-tech text-[11px] text-[#e7b866] hover:text-[#fff3ce] no-underline"
                    >
                      {locale === "uk" ? "Розглянути" : "Подробнее"}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playTick();
                        addItem(setId, 1);
                        openCart();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-[#e7b866] hover:text-black text-white px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border-0"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      {locale === "uk" ? "У кошик" : "В корзину"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="rounded-3xl overflow-hidden border border-white/12 bg-[#070709]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-white/12">
                  <th className="py-5 px-6 font-mono-tech text-[11px] uppercase tracking-wider text-white/40 w-56">
                    SPECIFICATION
                  </th>
                  {FLAVORS.map((flv) => (
                    <th key={flv.id} className="py-5 px-6 text-base font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: flv.accentHex }}
                        />
                        {flv.name[locale]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07] text-sm">
                <tr>
                  <td className="py-4 px-6 font-mono-tech text-xs text-white/50">
                    {SHOWCASE_COPY.lineup.specHeaders.cocoa[locale]}
                  </td>
                  {FLAVORS.map((flv) => (
                    <td key={flv.id} className="py-4 px-6 font-mono-tech text-[#f3d28e]">
                      {flv.cocoaPct}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 font-mono-tech text-xs text-white/50">
                    {SHOWCASE_COPY.lineup.specHeaders.shell[locale]}
                  </td>
                  {FLAVORS.map((flv) => (
                    <td key={flv.id} className="py-4 px-6 font-mono-tech text-white/85">
                      {flv.shellThickness}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 font-mono-tech text-xs text-white/50">
                    {SHOWCASE_COPY.lineup.specHeaders.intensity[locale]}
                  </td>
                  {FLAVORS.map((flv) => (
                    <td key={flv.id} className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#b87d2e] to-[#fff3ce]"
                            style={{ width: `${flv.intensity * 10}%` }}
                          />
                        </div>
                        <span className="font-mono-tech text-xs text-white/65">
                          {flv.intensity}/10
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 font-mono-tech text-xs text-white/50">
                    {SHOWCASE_COPY.lineup.specHeaders.acidity[locale]}
                  </td>
                  {FLAVORS.map((flv) => (
                    <td key={flv.id} className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${flv.acidity * 10}%`,
                              backgroundColor: flv.accentHex,
                            }}
                          />
                        </div>
                        <span className="font-mono-tech text-xs text-white/65">
                          {flv.acidity}/10
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 font-mono-tech text-xs text-white/50">
                    {SHOWCASE_COPY.lineup.specHeaders.temp[locale]}
                  </td>
                  {FLAVORS.map((flv) => (
                    <td key={flv.id} className="py-4 px-6 font-mono-tech text-white/85">
                      {flv.servingTemp}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 font-mono-tech text-xs text-white/50">
                    {SHOWCASE_COPY.lineup.specHeaders.fresh[locale]}
                  </td>
                  {FLAVORS.map((flv) => (
                    <td key={flv.id} className="py-4 px-6 text-white/75">
                      {flv.freshness[locale]}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 font-mono-tech text-xs text-white/50">
                    {SHOWCASE_COPY.lineup.specHeaders.sets[locale]}
                  </td>
                  {FLAVORS.map((flv) => {
                    const href = productPath(FLAVOR_TO_SET_ID[flv.id], locale);
                    return (
                      <td key={flv.id} className="py-4 px-6 text-xs">
                        <Link
                          href={href}
                          className="text-[#f3d28e] hover:text-white underline decoration-[#e7b866]/40 underline-offset-4 transition-colors"
                        >
                          {flv.setsIncluded[locale]}
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
