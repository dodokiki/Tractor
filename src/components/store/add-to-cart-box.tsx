"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./cart-context";
import type { ProductImage } from "./image";

export function AddToCartBox({
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
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = stock <= 0;

  function handleAdd() {
    if (outOfStock) return;
    addItem({ productId, name, priceSatang, stock, vendorId, vendorName, image }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    if (outOfStock) return;
    addItem({ productId, name, priceSatang, stock, vendorId, vendorName, image }, qty);
    router.push("/cart");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-ink">จำนวน</span>
        <div className="flex items-center rounded-full border border-line">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center text-lg text-ink disabled:opacity-30"
            disabled={outOfStock || qty <= 1}
            aria-label="ลดจำนวน"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            className="flex h-9 w-9 items-center justify-center text-lg text-ink disabled:opacity-30"
            disabled={outOfStock || qty >= stock}
            aria-label="เพิ่มจำนวน"
          >
            +
          </button>
        </div>
        <span className="text-xs text-muted">
          {outOfStock ? "สินค้าหมด" : `เหลือ ${stock} ชิ้น`}
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          {added ? "เพิ่มลงตะกร้าแล้ว ✓" : "🛒 หยิบใส่ตะกร้า"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          ซื้อเลย
        </button>
      </div>
    </div>
  );
}
