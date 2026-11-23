import { catalogFor } from "@/lib/products";
import { site } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  const ukItems = catalogFor("uk");
  const lines = [
    `# ${site.name} (${site.url})`,
    "",
    "> Крафтова майстерня бельгійського шоколаду ручної роботи у Харкові (Callebaut, Form V, 0% пальмової олії).",
    "",
    "## Контакти та доставка",
    `- Локація майстерні: ${site.addressUk}, м. ${site.cityUk}`,
    `- Телефон / Telegram / Viber: ${site.phone}`,
    `- Графік: Щодня з 9:00 до 20:00 (${site.hours})`,
    `- Безкоштовна доставка по Харкову від ${site.freeShippingFrom} ₴`,
    `- По Україні: Нова Пошта (термобокси в теплу погоду)`,
    "",
    "## Флагманські маршрути (2026)",
    `- Головна з інтерактивним 3D-шоу: ${site.url}/`,
    `- 3D BONBON PRO (українська): ${site.url}/3d`,
    `- 3D BONBON PRO (російська): ${site.url}/ru/3d`,
    `- Інтерактивний Шоколадний сомельє (знижка 10% SOMELIER10): ${site.url}/sommelier`,
    `- Повний каталог подарунків: ${site.url}/katalog`,
    "",
    "## Актуальний каталог наборів (UAH)",
    ...ukItems.map(
      (item) =>
        `- **${item.name}** — ${item.priceFrom ? "від " : ""}${item.price} ₴ (${item.weight}). ${item.short}`,
    ),
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
