import type { Metadata, Viewport } from "next";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../../app/globals.css";
import { LazyToaster } from "@/components/site/lazy-toaster";
import { Analytics } from "@/components/site/analytics";
import { SiteShell } from "@/components/site/site-shell";
import { dictionaries } from "@/lib/i18n";
import { site } from "@/lib/site";
import type { Locale } from "@/lib/i18n";

/* Шрифты Playfair Display и Manrope подключаются локально в globals.css без лишних Google Fonts CSS-запросов */

/* Speculation Rules API (2026): лёгкий prefetch при наведении без агрессивного prerender на 4G */
function SpeculationRules() {
  const rules = {
    prefetch: [
      {
        source: "document",
        where: {
          and: [
            { href_matches: "/*" },
            { not: { href_matches: "/api/*" } },
          ],
        },
        eagerness: "conservative",
      },
    ],
  };
  return (
    <script
      type="speculationrules"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(rules) }}
    />
  );
}

export function makeMetadata(locale: Locale): Metadata {
  const d = dictionaries[locale];
  const canonicalPath = locale === "uk" ? "/" : "/ru";
  return {
    metadataBase: new URL(site.url),
    title: { default: d.meta.title, template: `%s | CraftChoco (ChocoCraft)` },
    description: d.meta.description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        "uk-UA": "/",
        "ru-UA": "/ru",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "uk" ? "uk_UA" : "ru_UA",
      alternateLocale: locale === "uk" ? "ru_UA" : "uk_UA",
      url: canonicalPath,
      siteName: site.name,
      title: d.meta.title,
      description: d.meta.description,
      images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: d.meta.title,
      description: d.meta.description,
      images: ["/images/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    verification: {
      other: {
        "p:domain_verify": "f71cbf06d60dcb26654c0efa03f732fa",
      },
    },
    other: locale === "uk" ? {} : { "og:locale:alternate": "uk_UA" },
  };
}

export const viewport: Viewport = {
  themeColor: "#1c1009",
  width: "device-width",
  initialScale: 1,
};

export function RootLayoutBase({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const isVercel = Boolean(process.env.VERCEL);
  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col bg-cream font-body text-choco-900 antialiased">
        <SpeculationRules />
        {children}
        <LazyToaster />
        <Analytics />
        {isVercel && (
          <>
            <VercelAnalytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}

export { SiteShell };
