import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerShell } from "@/components/site/inner-shell";
import { BonbonShowcase3D } from "@/components/showcase/BonbonShowcase3D";
import { breadcrumbLd, innerMeta } from "@/lib/inner-meta";
import { site } from "@/lib/site";
import {
  SHOWCASE_SEO_CHAPTERS,
  chapterSwitchPair,
  findChapterBySlug,
} from "@/lib/showcase/seoChapters";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SHOWCASE_SEO_CHAPTERS.map((ch) => ({ chapter: ch.slug.ru }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const ch = findChapterBySlug(chapter, "ru");
  if (!ch) return {};

  return innerMeta("ru", {
    path: `/ru/3d/${ch.slug.ru}`,
    altPath: `/3d/${ch.slug.uk}`,
    title: ch.title.ru,
    description: ch.description.ru,
    image: ch.ogImage,
  });
}

export default async function ShowcaseChapterRuPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const ch = findChapterBySlug(chapter, "ru");
  if (!ch) notFound();

  const pair = chapterSwitchPair(chapter, "ru") ?? { uk: "/3d", ru: "/ru/3d" };

  const jsonLd = [
    breadcrumbLd([
      { name: "Главная", path: "/ru" },
      { name: "BONBON PRO 3D", path: "/ru/3d" },
      { name: ch.breadcrumbLabel.ru, path: pair.ru },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: ch.title.ru,
      description: ch.description.ru,
      url: `${site.url}${pair.ru}`,
      inLanguage: "ru-UA",
      isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
      primaryImageOfPage: `${site.url}${ch.ogImage}`,
    },
  ];

  return (
    <InnerShell locale="ru" switchPair={pair}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BonbonShowcase3D locale="ru" standalone3d initialChapter={ch.id} />
    </InnerShell>
  );
}
