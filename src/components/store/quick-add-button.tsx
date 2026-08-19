"use client";

import { useState } from "react";
import { useCart } from "./cart-context";
import type { ProductImage } from "./image";
import { fireCartToast } from "./toast-host";

export function QuickAddButton({
  productId,
  name,
  priceSatang,
  stock,
  vendorId,
  vendorName,
  image,
}: {
  productId: string;
  name: string;
  priceSatang: number;
  stock: number;
  vendorId: string;
  vendorName: string;
  image: ProductImage;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = stock <= 0;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem({ productId, name, priceSatang, stock, vendorId, vendorName, image }, 1);
    setAdded(true);
    fireCartToast(`เพิ่ม "${name}" ลงตะกร้าแล้ว`);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={outOfStock}
      aria-label={`หยิบใส่ตะกร้า ${name}`}
      className={`absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full text-base shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:opacity-0 sm:translate-y-1 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 ${
        outOfStock
          ? "cursor-not-allowed bg-line text-muted"
          : added
            ? "bg-primary-dark text-white"
            : "bg-accent text-white hover:bg-accent-dark active:scale-95"
      }`}
    >
      <span aria-hidden>{added ? "✓" : "🛒"}</span>
    </button>
  );
}
