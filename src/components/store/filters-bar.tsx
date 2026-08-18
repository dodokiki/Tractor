"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type FilterCategory = { slug: string; name: string; emoji: string };

export function FiltersBar({
  categories,
  brands,
  initial,
}: {
  categories: FilterCategory[];
  brands: string[];
  initial: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
}) {
  const router = useRouter();
  const [category, setCategory] = useState(initial.category ?? "");
  const [brand, setBrand] = useState(initial.brand ?? "");
  const [minPrice, setMinPrice] = useState(initial.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice ?? "");
  const [sort, setSort] = useState(initial.sort ?? "new");

  function apply(overrides: Record<string, string | undefined> = {}) {
    const values: Record<string, string | undefined> = {
      q: initial.q,
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
      ...overrides,
    };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value);
    }
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          หมวดหมู่
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              apply({ category: e.target.value || undefined });
            }}
            className="rounded-lg border border-line bg-white px-2 py-2 text-sm text-ink"
          >
            <option value="">ทั้งหมด</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          ยี่ห้อรถ
          <select
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              apply({ brand: e.target.value || undefined });
            }}
            className="rounded-lg border border-line bg-white px-2 py-2 text-sm text-ink"
          >
            <option value="">ทั้งหมด</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          ราคาต่ำสุด (บาท)
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="rounded-lg border border-line bg-white px-2 py-2 text-sm text-ink"
            placeholder="0"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          ราคาสูงสุด (บาท)
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="rounded-lg border border-line bg-white px-2 py-2 text-sm text-ink"
            placeholder="ไม่จำกัด"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs font-medium text-muted">
          เรียงลำดับ
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              apply({ sort: e.target.value });
            }}
            className="rounded-lg border border-line bg-white px-2 py-2 text-sm text-ink"
          >
            <option value="new">ใหม่ล่าสุด</option>
            <option value="popular">ยอดนิยม</option>
            <option value="price_asc">ราคา: ต่ำ-สูง</option>
            <option value="price_desc">ราคา: สูง-ต่ำ</option>
            <option value="name">ชื่อสินค้า A-Z</option>
          </select>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => apply()}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            กรองสินค้า
          </button>
          <button
            type="button"
            onClick={() => {
              setCategory("");
              setBrand("");
              setMinPrice("");
              setMaxPrice("");
              setSort("new");
              router.push(initial.q ? `/products?q=${encodeURIComponent(initial.q)}` : "/products");
            }}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted hover:bg-surface"
          >
            ล้างตัวกรอง
          </button>
        </div>
      </div>
    </div>
  );
}
