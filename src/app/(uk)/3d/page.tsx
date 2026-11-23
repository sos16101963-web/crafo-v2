import type { Metadata } from "next";
import { InnerShell } from "@/components/site/inner-shell";
import { BonbonShowcase3D } from "@/components/showcase/BonbonShowcase3D";
import { innerMeta } from "@/lib/inner-meta";
import { switchPairFor } from "@/lib/pages";

export const dynamic = "force-static";

export const metadata: Metadata = innerMeta("uk", {
  path: "/3d",
  altPath: "/ru/3d",
  title: "BONBON PRO 3D — Інтерактивний 3D-тур цукерок Callebaut | CraftChoco Харків",
  description:
    "Інтерактивна 3D-презентація крафтових цукерок CraftChoco у Харкові: 9 глав із рентгеном, тепловізором, розколом 4 смаків наживо та швидким замовленням.",
  image: "/frames/posters/spin.webp",
});

export default function Showcase3DUkPage() {
  return (
    <InnerShell locale="uk" switchPair={switchPairFor("/3d")}>
      <BonbonShowcase3D locale="uk" standalone3d />
    </InnerShell>
  );
}
