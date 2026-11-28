import ReactDOM from "react-dom";
import { Header } from "@/components/site/header";
import { BonbonShowcase3D } from "@/components/showcase/BonbonShowcase3D";
import { ThermoBanner } from "@/components/site/thermo-banner";
import { PhotoMarqueeLazy } from "@/components/site/photo-marquee-lazy";
import { HolidayBanner } from "@/components/site/holiday-banner";
import { Catalog } from "@/components/site/catalog";
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
import { LeadMagnetLazy } from "@/components/site/lead-magnet-lazy";
import { MobileBottomBar } from "@/components/site/mobile-bottom-bar";
import { JsonLd } from "@/components/site/json-ld";
import { StarSprite } from "@/components/site/stars";
import { catalogFor } from "@/lib/products";
import type { Locale } from "@/lib/i18n";

/**
 * Оболочка сайта — одна на обе локали.
 * uk: путь «/» (root-группа (uk)), ru: путь «/ru» (root-группа (ru)).
 */
export function SiteShell({ locale }: { locale: Locale }) {
  // Мобильный постер встроен в HTML (data URI в ChapterSpin) — preload нужен только десктопному постеру
  ReactDOM.preload("/frames/posters/spin.webp", {
    as: "image",
    fetchPriority: "high",
    media: "(min-width: 768px)",
  });

  const allProducts = catalogFor(locale);
  const initialProducts = allProducts.slice(0, 6).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    categoryLabel: p.categoryLabel,
    price: p.price,
    priceFrom: p.priceFrom,
    weight: p.weight,
    cocoa: p.cocoa,
    rating: p.rating,
    reviews: p.reviews,
    badges: p.badges,
    short: p.short,
    character: p.character,
    contents: p.contents,
    description: p.description,
    ingredients: p.ingredients,
    storage: p.storage,
    image: p.image,
    cutImage: p.cutImage,
    gallery: p.gallery?.length ? [p.gallery[0]] : undefined,
    variants: p.variants,
    alt: p.alt,
  }));
  const categoryCounts: Record<string, number> = {
    all: allProducts.length,
    sets: allProducts.filter((p) => p.category === "sets").length,
    tiles: allProducts.filter((p) => p.category === "tiles").length,
    flowers: allProducts.filter((p) => p.category === "flowers").length,
    cheese: allProducts.filter((p) => p.category === "cheese").length,
  };

  return (
    <>
      <JsonLd locale={locale} />
      <StarSprite />
      <Header locale={locale} />
      <main className="flex-1">
        {/* Флагманская 3D-презентация BONBON PRO (Poster-First, 0 кадров до первого жеста) */}
        <BonbonShowcase3D locale={locale} />

        <div className="cv-auto">
          <ThermoBanner locale={locale} />
          <PhotoMarqueeLazy locale={locale} />
          {/* Сезонний блок: Солодкі подарунки на Миколая (6 грудня) та Новий Рік */}
          <HolidayBanner locale={locale} />
        </div>

        <div className="cv-auto">
          <Catalog
            locale={locale}
            initialLimit={6}
            initialProducts={initialProducts}
            categoryCounts={categoryCounts}
          />
        </div>

        <div className="cv-auto">
          <SommelierLazy locale={locale} />
        </div>

        <div className="cv-auto">
          <Features locale={locale} />
          <About locale={locale} />
        </div>

        <div className="cv-auto">
          <Craft locale={locale} />
          <Reviews locale={locale} />
        </div>

        <div className="cv-auto">
          <Delivery locale={locale} />
          <Faq locale={locale} />
        </div>

        <div className="cv-auto">
          <Corporate locale={locale} />
          <ContactCta locale={locale} />
        </div>
      </main>
      <div className="cv-auto">
        <Footer locale={locale} />
      </div>
      <CartSheetLazy locale={locale} />
      <LeadMagnetLazy locale={locale} />
      <MobileBottomBar locale={locale} isHome />
    </>
  );
}
