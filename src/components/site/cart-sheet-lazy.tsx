"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n";
import { useCart } from "@/store/cart";

// корзина не участвует в первом рендере — грузим Radix Sheet и каталог только при первом открытии
const CartSheet = dynamic(() => import("./cart-sheet").then((m) => m.CartSheet), {
  ssr: false,
});

export function CartSheetLazy({ locale }: { locale: Locale }) {
  const isOpen = useCart((s) => s.isOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
  }, [isOpen]);

  return mounted ? <CartSheet locale={locale} /> : null;
}
