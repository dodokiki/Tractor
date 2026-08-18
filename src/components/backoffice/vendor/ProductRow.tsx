"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Product } from "@prisma/client";
import { formatBaht, bahtToSatang } from "@/lib/money";
import Toggle from "@/components/backoffice/Toggle";
import ProductFormFields, { type ProductFormValues } from "./ProductFormFields";

function parseImage(imageJson: string) {
  try {
    const j = JSON.parse(imageJson) as { emoji?: string; from?: string; to?: string };
    return { emoji: j.emoji ?? "🔩", from: j.from ?? "#1B7A43", to: j.to ?? "#2FA55C" };
  } catch {
    return { emoji: "🔩", from: "#1B7A43", to: "#2FA55C" };
  }
}

export default function ProductRow({
  product,
  categories,
}: {
  product: Product & { category: Category };
  categories: Category[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const image = parseImage(product.imageJson);

  async function handleSave(values: ProductFormValues) {
    try {
      const res = await fetch(`/api/vendor/products/${product.id}`, {
        method: "PATCH",
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
        return { ok: false, error: json?.error ?? "บันทึกไม่สำเร็จ" };
      }
      router.refresh();
      setEditing(false);
      return { ok: true };
    } catch {
      return { ok: false, error: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้" };
    }
  }

  if (editing) {
    return (
      <tr className="border-b border-line last:border-0 bg-surface/60">
        <td colSpan={6} className="px-3 py-3">
          <ProductFormFields
            categories={categories}
            initial={{
              name: product.name,
              categoryId: product.categoryId,
              sku: product.sku,
              brand: product.brand ?? "",
              priceBaht: (product.priceSatang / 100).toString(),
              stock: product.stock.toString(),
              emoji: image.emoji,
              from: image.from,
              to: image.to,
              description: product.description ?? "",
            }}
            submitLabel="บันทึกการแก้ไข"
            onSubmit={handleSave}
            onCancel={() => setEditing(false)}
          />
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg"
            style={{ background: `linear-gradient(135deg, ${image.from}, ${image.to})` }}
          >
            {image.emoji}
          </div>
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-xs text-muted">{product.sku}</div>
          </div>
        </div>
      </td>
      <td className="py-2.5 pr-3">
        {product.category.emoji} {product.category.name}
      </td>
      <td className="py-2.5 pr-3">{formatBaht(product.priceSatang)}</td>
      <td className="py-2.5 pr-3">{product.stock.toLocaleString("th-TH")}</td>
      <td className="py-2.5 pr-3">
        <Toggle url={`/api/vendor/products/${product.id}`} field="active" value={product.active} />
      </td>
      <td className="py-2.5 pr-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface"
        >
          แก้ไข
        </button>
      </td>
    </tr>
  );
}
