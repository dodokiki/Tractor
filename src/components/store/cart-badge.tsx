"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart-context";

export function CartBadge() {
  const { totalCount } = useCart();
  const [bounce, setBounce] = useState(false);
  const prevCount = useRef(totalCount);

  useEffect(() => {
    if (totalCount > prevCount.current) {
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 500);
      prevCount.current = totalCount;
      return () => clearTimeout(t);
    }
    prevCount.current = totalCount;
  }, [totalCount]);

  return (
    <Link
      href="/cart"
      aria-label="ตะกร้าสินค้า"
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      🛒
      {totalCount > 0 && (
        <span
          className={`absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white shadow-sm ${
            bounce ? "animate-bounce" : ""
          }`}
        >
          {totalCount > 99 ? "99+" : totalCount}
        </span>
      )}
    </Link>
  );
}
