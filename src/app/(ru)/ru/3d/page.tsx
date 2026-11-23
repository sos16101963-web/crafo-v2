import type { Metadata } from "next";
import { InnerShell } from "@/components/site/inner-shell";
import { BonbonShowcase3D } from "@/components/showcase/BonbonShowcase3D";
import { innerMeta } from "@/lib/inner-meta";
import { switchPairFor } from "@/lib/pages";

export const dynamic = "force-static";

export const metadata: Metadata = innerMeta("ru", {
  path: "/ru/3d",
  altPath: "/3d",
  title: "BONBON PRO 3D — Интерактивный 3D-тур конфет Callebaut | CraftChoco Харьков",
  description:
    "Интерактивная 3D-презентация крафтовых конфет CraftChoco в Харькове: 9 глав с рентгеном, тепловизором, расколом 4 вкусов в разрезе и мгновенным заказом.",
  image: "/frames/posters/spin.webp",
});

export default function Showcase3DRuPage() {
  return (
    <InnerShell locale="ru" switchPair={switchPairFor("/ru/3d")}>
      <BonbonShowcase3D locale="ru" standalone3d />
    </InnerShell>
  );
}
