"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./cart-context";
import type { ProductImage } from "./image";
import { fireCartToast } from "./toast-host";

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
    fireCartToast(`เพิ่ม "${name}" ลงตะกร้าแล้ว × ${qty}`);
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
            className="flex h-9 w-9 items-center justify-center text-lg text-ink transition hover:bg-surface disabled:opacity-30"
            disabled={outOfStock || qty <= 1}
            aria-label="ลดจำนวน"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            className="flex h-9 w-9 items-center justify-center text-lg text-ink transition hover:bg-surface disabled:opacity-30"
            disabled={outOfStock || qty >= stock}
            aria-label="เพิ่มจำนวน"
          >
            +
          </button>
        </div>
        <span className={`text-xs ${outOfStock ? "font-semibold text-accent-dark" : "text-muted"}`}>
          {outOfStock ? "สินค้าหมด" : `เหลือ ${stock} ชิ้น`}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-line disabled:text-muted disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {added ? "เพิ่มลงตะกร้าแล้ว ✓" : "🛒 หยิบใส่ตะกร้า"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-line disabled:text-muted disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          ซื้อเลย
        </button>
      </div>
    </div>
  );
}
