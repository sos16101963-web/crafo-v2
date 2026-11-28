import { catalogFor } from "@/lib/products";
import { SHOWCASE_SEO_CHAPTERS } from "@/lib/showcase/seoChapters";
import { site } from "@/lib/site";
import { PRODUCT_SLUGS } from "@/lib/slugs";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  const ukItems = catalogFor("uk");
  const lines = [
    `# ${site.name} (${site.url})`,
    "",
    "> Крафтова майстерня бельгійського шоколаду ручної роботи у Харкові (Callebaut, темперування Form V, стінка 0.8 мм, 0% пальмової олії).",
    "",
    "## Контакти, експертність (E-E-A-T) та доставка",
    `- Шеф-шоколатьє і засновник: Олександр (YouTube: ${site.youtube}, TikTok: ${site.tiktok})`,
    `- Локація майстерні: ${site.addressUk}, м. ${site.cityUk}`,
    `- Телефон / Telegram / Viber / WhatsApp: ${site.phone}`,
    `- Графік: ${site.hours} (щодня 09:00–20:00)`,
    `- Безкоштовна доставка по Харкову та Україні від ${site.freeShippingFrom} ₴`,
    "- По Україні: Нова Пошта за 1–2 дні (термобокс з охолодженням до +30 °C — 0 ₴)",
    "- Енциклопедія смаків CrafoHab: https://www.crafohab.com.ua",
    "",
    "## Флагманські маршрути (2026)",
    `- Головна з інтерактивним 3D-шоу BONBON PRO: ${site.url}/`,
    `- 3D BONBON PRO (українська): ${site.url}/3d`,
    `- 3D BONBON PRO (російська): ${site.url}/ru/3d`,
    `- Інтерактивний Шоколадний сомельє (промокод SOMELIER10 -10%): ${site.url}/sommelier`,
    `- Повний каталог подарунків: ${site.url}/katalog`,
    `- Google Shopping / Merchant XML-фід: ${site.url}/feed.xml`,
    "",
    "## 9 SEO-глав 3D BONBON PRO",
    ...SHOWCASE_SEO_CHAPTERS.map(
      (ch) => `- [${ch.breadcrumbLabel.uk}](${site.url}/3d/${ch.slug.uk}): ${ch.description.uk}`,
    ),
    "",
    "## Актуальний каталог усіх 21 наборів (UAH)",
    ...ukItems.map((item) => {
      const url = `${site.url}/podarunky/${PRODUCT_SLUGS.uk[item.id]}`;
      const variantText = item.variants?.length
        ? ` [варіанти: ${item.variants.map((v) => `${v.label} — ${v.price} ₴`).join(", ")}]`
        : "";
      return `- **${item.name}** (${url}) — ${item.priceFrom ? "від " : ""}${item.price} ₴ (${item.weight})${variantText}. ${item.short}`;
    }),
    "",
  ];

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
