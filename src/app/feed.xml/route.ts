import { NextResponse } from "next/server";
import { site } from "@/lib/site";
import { productsUk } from "@/lib/products-uk";
import { PRODUCT_SLUGS } from "@/lib/slugs";

function renderFeedItem({
  id,
  itemGroupId,
  title,
  description,
  link,
  imageLink,
  additionalImageLink,
  price,
  categoryLabel,
}: {
  id: string;
  itemGroupId?: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImageLink?: string;
  price: number;
  categoryLabel: string;
}) {
  const groupTag = itemGroupId ? `\n      <g:item_group_id>${itemGroupId}</g:item_group_id>` : "";
  const additionalTag = additionalImageLink
    ? `\n      <g:additional_image_link>${additionalImageLink}</g:additional_image_link>`
    : "";

  return `    <item>
      <g:id>${id}</g:id>${groupTag}
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>${additionalTag}
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${price.toFixed(2)} UAH</g:price>
      <g:brand>CraftChoco</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Food Items &gt; Candy &amp; Chocolate</g:google_product_category>
      <g:product_type><![CDATA[Солодощі > Шоколад ручної роботи > ${categoryLabel}]]></g:product_type>
      <g:shipping>
        <g:country>UA</g:country>
        <g:service>Кур'єр по Харкову / Нова пошта</g:service>
        <g:price>${site.courierPrice.toFixed(2)} UAH</g:price>
      </g:shipping>
    </item>`;
}

/**
 * Google Shopping & Merchant Center XML Product Feed (RSS 2.0).
 * Забезпечує автоматичний експорт усіх авторських товарів та варіантів коробок
 * до безкоштовної програми Google Free Product Listings та товарної каруселі пошуку.
 */
export async function GET() {
  const itemsXml = productsUk
    .flatMap((p) => {
      const slug = PRODUCT_SLUGS.uk[p.id];
      const link = `${site.url}/podarunky/${slug}`;
      const secondImage = p.cutImage ?? p.gallery?.[0]?.src;
      const additionalImageLink = secondImage ? `${site.url}${secondImage}` : undefined;
      const cleanTitle = p.name.replace(/«|»/g, "").trim();

      if (p.variants?.length) {
        return p.variants.map((v) =>
          renderFeedItem({
            id: `${p.id}-${v.id}`,
            itemGroupId: p.id,
            title: `Шоколад ручної роботи «${cleanTitle}» (${v.label}) — ${p.categoryLabel} CraftChoco`,
            description: `Шоколад ручної роботи ${cleanTitle} (${v.label}, ${v.weight}) від майстерні CraftChoco (ChocoCraft). ${p.short} 100% бельгійський шоколад Callebaut. Свіжа партія у Харкові, доставка в термобоксах по Україні.`,
            link,
            imageLink: `${site.url}${v.image ?? p.image}`,
            additionalImageLink,
            price: v.price,
            categoryLabel: p.categoryLabel,
          }),
        );
      }

      return [
        renderFeedItem({
          id: p.id,
          title: `Шоколад ручної роботи «${cleanTitle}» — ${p.categoryLabel} CraftChoco (ChocoCraft)`,
          description: `Шоколад ручної роботи ${cleanTitle} від майстерні CraftChoco (ChocoCraft). ${p.short} 100% бельгійський шоколад Callebaut. Свіжа партія у Харкові, доставка в термобоксах по Україні.`,
          link,
          imageLink: `${site.url}${p.image}`,
          additionalImageLink,
          price: p.price,
          categoryLabel: p.categoryLabel,
        }),
      ];
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${site.name} — Шоколад ручної роботи</title>
    <link>${site.url}</link>
    <description>${site.slogan}</description>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
