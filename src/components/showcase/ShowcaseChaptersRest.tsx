"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n";
import type { DeviceProfile } from "@/lib/showcase/deviceTier";

const ChapterCrunch = dynamic(() => import("./ChapterCrunch").then((m) => m.ChapterCrunch));
const ChapterLamination = dynamic(() => import("./ChapterLamination").then((m) => m.ChapterLamination));
const ChapterGanache = dynamic(() => import("./ChapterGanache").then((m) => m.ChapterGanache));
const ChapterTempering = dynamic(() => import("./ChapterTempering").then((m) => m.ChapterTempering));
const ChapterScanner = dynamic(() => import("./ChapterScanner").then((m) => m.ChapterScanner));
const ChapterInspector360 = dynamic(() =>
  import("./ChapterInspector360").then((m) => m.ChapterInspector360),
);
const ChapterLineup = dynamic(() => import("./ChapterLineup").then((m) => m.ChapterLineup));
const ChapterOrder = dynamic(() => import("./ChapterOrder").then((m) => m.ChapterOrder));

export interface ShowcaseChaptersRestProps {
  locale: Locale;
  profile: DeviceProfile;
  standalone3d: boolean;
  chapterHandlers: {
    crunch: () => void;
    lamination: () => void;
    ganache: () => void;
    tempering: () => void;
    scanner: () => void;
    inspector: () => void;
  };
}

export const ShowcaseChaptersRest: React.FC<ShowcaseChaptersRestProps> = ({
  locale,
  profile,
  standalone3d,
  chapterHandlers,
}) => {
  return (
    <>
      <ChapterCrunch locale={locale} profile={profile} onActive={chapterHandlers.crunch} />
      <ChapterLamination locale={locale} profile={profile} onActive={chapterHandlers.lamination} />
      <ChapterGanache locale={locale} profile={profile} onActive={chapterHandlers.ganache} />
      <ChapterTempering locale={locale} profile={profile} onActive={chapterHandlers.tempering} />
      <ChapterScanner locale={locale} profile={profile} onActive={chapterHandlers.scanner} />
      <ChapterInspector360 locale={locale} profile={profile} onActive={chapterHandlers.inspector} />
      <ChapterLineup locale={locale} />
      <ChapterOrder locale={locale} standalone3d={standalone3d} />
    </>
  );
};
