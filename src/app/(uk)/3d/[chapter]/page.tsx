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
  return SHOWCASE_SEO_CHAPTERS.map((ch) => ({ chapter: ch.slug.uk }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const ch = findChapterBySlug(chapter, "uk");
  if (!ch) return {};

  return innerMeta("uk", {
    path: `/3d/${ch.slug.uk}`,
    altPath: `/ru/3d/${ch.slug.ru}`,
    title: ch.title.uk,
    description: ch.description.uk,
    image: ch.ogImage,
  });
}

export default async function ShowcaseChapterUkPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const ch = findChapterBySlug(chapter, "uk");
  if (!ch) notFound();

  const pair = chapterSwitchPair(chapter, "uk") ?? { uk: "/3d", ru: "/ru/3d" };

  const jsonLd = [
    breadcrumbLd([
      { name: "Головна", path: "/" },
      { name: "BONBON PRO 3D", path: "/3d" },
      { name: ch.breadcrumbLabel.uk, path: pair.uk },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: ch.title.uk,
      description: ch.description.uk,
      url: `${site.url}${pair.uk}`,
      inLanguage: "uk-UA",
      isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
      primaryImageOfPage: `${site.url}${ch.ogImage}`,
    },
  ];

  return (
    <InnerShell locale="uk" switchPair={pair}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BonbonShowcase3D locale="uk" standalone3d initialChapter={ch.id} />
    </InnerShell>
  );
}
