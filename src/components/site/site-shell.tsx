import ReactDOM from "react-dom";
import dynamic from "next/dynamic";
import { Header } from "@/components/site/header";
import { BonbonShowcase3D } from "@/components/showcase/BonbonShowcase3D";
import { ThermoBanner } from "@/components/site/thermo-banner";
import { PhotoMarquee } from "@/components/site/photo-marquee";
import { HolidayBanner } from "@/components/site/holiday-banner";
import { Features } from "@/components/site/features";
import { About } from "@/components/site/about";
import { Craft } from "@/components/site/craft";
import { Corporate } from "@/components/site/corporate";
import { Reviews } from "@/components/site/reviews";
import { Delivery } from "@/components/site/delivery";
import { Faq } from "@/components/site/faq";
import { ContactCta } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { CartSheetLazy } from "@/components/site/cart-sheet-lazy";
import { SommelierLazy } from "@/components/site/sommelier-lazy";
import { MobileBottomBar } from "@/components/site/mobile-bottom-bar";
import { JsonLd } from "@/components/site/json-ld";
import { StarSprite } from "@/components/site/stars";
import type { Locale } from "@/lib/i18n";

const Catalog = dynamic(() => import("@/components/site/catalog").then((m) => m.Catalog));
const LeadMagnet = dynamic(() => import("@/components/site/lead-magnet").then((m) => m.LeadMagnet));

/**
 * Оболочка сайта — одна на обе локали.
 * uk: путь «/» (root-группа (uk)), ru: путь «/ru» (root-группа (ru)).
 */
export function SiteShell({ locale }: { locale: Locale }) {
  ReactDOM.preload("/frames/mobile/spin/frame_0000.webp", {
    as: "image",
    fetchPriority: "high",
    media: "(max-width: 767px)",
  });
  ReactDOM.preload("/frames/posters/spin.webp", {
    as: "image",
    fetchPriority: "high",
    media: "(min-width: 768px)",
  });
  return (
    <>
      <JsonLd locale={locale} />
      <StarSprite />
      <Header locale={locale} />
      <main className="flex-1">
        {/* Флагманская 3D-презентация BONBON PRO (Poster-First, 0 кадров до первого жеста) */}
        <BonbonShowcase3D locale={locale} />
        <ThermoBanner locale={locale} />
        <PhotoMarquee locale={locale} />

        {/* Сезонний блок: Солодкі подарунки на Миколая (6 грудня) та Новий Рік */}
        <HolidayBanner locale={locale} />

        <Catalog locale={locale} />
        <SommelierLazy locale={locale} />
        <Features locale={locale} />
        <About locale={locale} />
        <Craft locale={locale} />
        <Reviews locale={locale} />
        <Delivery locale={locale} />
        <Faq locale={locale} />
        <Corporate locale={locale} />
        <ContactCta locale={locale} />
      </main>
      <Footer locale={locale} />
      <CartSheetLazy locale={locale} />
      <LeadMagnet locale={locale} />
      <MobileBottomBar locale={locale} isHome />
    </>
  );
}
