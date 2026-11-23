"use client";

import React from "react";
import type { Locale } from "@/lib/i18n";
import { FLAVORS, SHOWCASE_COPY } from "@/lib/showcase/content";

export const ChapterLineup: React.FC<{ locale: Locale }> = ({ locale }) => {
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
          {FLAVORS.map((flv) => (
            <article
              key={flv.id}
              className="group rounded-3xl overflow-hidden border border-white/12 bg-[#070709] hover:border-[#e7b866]/55 transition-all duration-300"
            >
              <div className="relative aspect-[16/10] bg-black overflow-hidden">
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
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-white m-0">{flv.name[locale]}</h3>
                <p className="font-display italic text-sm text-[#f3d28e] mt-1 mb-3">
                  {flv.subtitle[locale]}
                </p>
                <p className="text-xs text-white/60 leading-relaxed m-0">
                  {flv.fillingArchitecture[locale]}
                </p>
              </div>
            </article>
          ))}
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
                  {FLAVORS.map((flv) => (
                    <td key={flv.id} className="py-4 px-6 text-xs text-white/70">
                      {flv.setsIncluded[locale]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
