"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@prisma/client";
import { bahtToSatang } from "@/lib/money";
import ProductFormFields, {
  EMPTY_PRODUCT_VALUES,
  type ProductFormValues,
} from "./ProductFormFields";

export default function AddProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [key, setKey] = useState(0);

  async function handleSubmit(values: ProductFormValues) {
    try {
      const res = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          categoryId: values.categoryId,
          sku: values.sku.trim() || undefined,
          brand: values.brand.trim() || undefined,
          priceSatang: bahtToSatang(Number(values.priceBaht)),
          stock: Number(values.stock) || 0,
          description: values.description.trim() || undefined,
          imageJson: JSON.stringify({ emoji: values.emoji || "🔩", from: values.from, to: values.to }),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        return { ok: false, error: json?.error ?? "เพิ่มสินค้าไม่สำเร็จ" };
      }
      router.refresh();
      setKey((k) => k + 1); // reset form
      return { ok: true };
    } catch {
      return { ok: false, error: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้" };
    }
  }

  return (
    <ProductFormFields
      key={key}
      categories={categories}
      initial={EMPTY_PRODUCT_VALUES}
      submitLabel="+ เพิ่มสินค้า"
      onSubmit={handleSubmit}
    />
  );
}
