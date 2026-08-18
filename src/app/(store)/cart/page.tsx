"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatBaht } from "@/lib/money";
import { useCart } from "@/components/store/cart-context";
import { gradientStyle } from "@/components/store/image";

export default function CartPage() {
  const { items, couponCode, setCouponCode, removeItem, setQty, totalSatang, isReady } =
    useCart();
  const router = useRouter();
  const [couponInput, setCouponInput] = useState(couponCode);

  const groups = useMemo(() => {
    const map = new Map<string, { vendorId: string; vendorName: string; items: typeof items }>();
    for (const item of items) {
      const g = map.get(item.vendorId);
      if (g) g.items.push(item);
      else map.set(item.vendorId, { vendorId: item.vendorId, vendorName: item.vendorName, items: [item] });
    }
    return Array.from(map.values());
  }, [items]);

  if (!isReady) {
    return <div className="mx-auto max-w-4xl px-3 py-10 text-center text-sm text-muted">กำลังโหลดตะกร้า...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-3 py-16 text-center">
        <span className="text-5xl" aria-hidden>🛒</span>
        <p className="text-lg font-bold text-ink">ตะกร้าของคุณว่างเปล่า</p>
        <p className="text-sm text-muted">เลือกซื้ออะไหล่และอุปกรณ์รถแทรกเตอร์ได้เลย</p>
        <Link
          href="/products"
          className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark"
        >
          ไปเลือกซื้อสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-3 py-6 sm:px-6 sm:py-10">
      <h1 className="text-xl font-bold text-ink sm:text-2xl">ตะกร้าสินค้า</h1>
      <p className="rounded-xl bg-accent/10 px-4 py-2.5 text-sm text-accent-dark">
        ⚠️ คำสั่งซื้อของคุณจะถูกแยกเป็นออเดอร์ย่อยตามร้านค้า ({groups.length} ร้าน) จัดส่งและติดตามสถานะแยกกัน
      </p>

      <div className="flex flex-col gap-4">
        {groups.map((g) => (
          <div key={g.vendorId} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-ink">
              🏪 {g.vendorName}
            </p>
            <div className="flex flex-col divide-y divide-line">
              {g.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 py-3">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl"
                    style={gradientStyle(item.image)}
                  >
                    <span aria-hidden>{item.image.emoji}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.productId}`}
                      className="line-clamp-2 text-sm font-semibold text-ink hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm font-bold text-primary">{formatBaht(item.priceSatang)}</p>
                  </div>
                  <div className="flex shrink-0 items-center rounded-full border border-line">
                    <button
                      type="button"
                      onClick={() => setQty(item.productId, item.qty - 1)}
                      className="flex h-8 w-8 items-center justify-center text-ink"
                      aria-label="ลดจำนวน"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(item.productId, item.qty + 1)}
                      disabled={item.qty >= item.stock}
                      className="flex h-8 w-8 items-center justify-center text-ink disabled:opacity-30"
                      aria-label="เพิ่มจำนวน"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label="ลบสินค้า"
                    className="shrink-0 text-muted hover:text-red-600"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-right text-sm text-muted">
              รวมร้านนี้:{" "}
              <span className="font-bold text-ink">
                {formatBaht(g.items.reduce((s, i) => s + i.priceSatang * i.qty, 0))}
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="กรอกโค้ดส่วนลด (ถ้ามี)"
            className="flex-1 rounded-full border border-line px-4 py-2 text-sm uppercase text-ink"
          />
          <button
            type="button"
            onClick={() => setCouponCode(couponInput)}
            className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            ใช้โค้ด
          </button>
        </div>
        {couponCode && (
          <p className="text-xs text-muted">
            ใช้โค้ด <span className="font-semibold text-ink">{couponCode}</span> — ระบบจะตรวจสอบส่วนลดอีกครั้งตอนชำระเงิน
          </p>
        )}

        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-sm text-muted">ยอดรวมสินค้า</span>
          <span className="text-xl font-extrabold text-ink">{formatBaht(totalSatang)}</span>
        </div>
        <p className="text-xs text-muted">* ยังไม่รวมค่าจัดส่งและส่วนลด (คำนวณจริงตอนชำระเงิน)</p>

        <button
          type="button"
          onClick={() => router.push("/checkout")}
          className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-dark"
        >
          ไปชำระเงิน
        </button>
      </div>
    </div>
  );
}
