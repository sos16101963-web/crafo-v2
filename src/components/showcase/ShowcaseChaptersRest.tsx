"use client";

import React from "react";
import type { Locale } from "@/lib/i18n";
import type { DeviceProfile } from "@/lib/showcase/deviceTier";
import { ChapterCrunch } from "./ChapterCrunch";
import { ChapterLamination } from "./ChapterLamination";
import { ChapterGanache } from "./ChapterGanache";
import { ChapterTempering } from "./ChapterTempering";
import { ChapterScanner } from "./ChapterScanner";
import { ChapterInspector360 } from "./ChapterInspector360";
import { ChapterLineup } from "./ChapterLineup";
import { ChapterOrder } from "./ChapterOrder";

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
