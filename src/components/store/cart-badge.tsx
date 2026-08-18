"use client";

import Link from "next/link";
import { useCart } from "./cart-context";

export function CartBadge() {
  const { totalCount } = useCart();
  return (
    <Link
      href="/cart"
      aria-label="ตะกร้าสินค้า"
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-xl text-white transition hover:bg-white/10"
    >
      🛒
      {totalCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
          {totalCount > 99 ? "99+" : totalCount}
        </span>
      )}
    </Link>
  );
}
