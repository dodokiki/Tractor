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
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount = [category, brand, minPrice, maxPrice].filter(Boolean).length;

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

  function clearAll() {
    setCategory("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSort("new");
    router.push(initial.q ? `/products?q=${encodeURIComponent(initial.q)}` : "/products");
  }

  return (
    <div className="flex flex-col gap-3">
      {/* แถวชิปหมวดหมู่ — แสดงตลอดทุกขนาดจอ เลื่อนแนวนอนบนมือถือ */}
      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        <button
          type="button"
          onClick={() => {
            setCategory("");
            apply({ category: undefined });
          }}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            category === "" ? "bg-primary text-white" : "bg-white text-ink ring-1 ring-line"
          }`}
        >
          ทั้งหมด
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => {
              setCategory(c.slug);
              apply({ category: c.slug });
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              category === c.slug ? "bg-primary text-white" : "bg-white text-ink ring-1 ring-line"
            }`}
          >
            {c.emoji} {c.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="shrink-0 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent-dark ring-1 ring-accent/30"
        >
          ⚙️ ตัวกรอง{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
      </div>

      <div
        className={`flex-col gap-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5 lg:sticky lg:top-24 lg:flex ${
          mobileOpen ? "flex" : "hidden lg:flex"
        }`}
      >
        <div className="hidden items-center justify-between lg:flex">
          <h2 className="text-sm font-bold text-ink">ตัวกรองสินค้า</h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-muted hover:text-primary"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>

        {/* หมวดหมู่ — เฉพาะ desktop sidebar (มือถือใช้ชิปด้านบนแล้ว) */}
        <div className="hidden flex-col gap-2 lg:flex">
          <p className="text-xs font-semibold text-muted">หมวดหมู่</p>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                setCategory("");
                apply({ category: undefined });
              }}
              className={`rounded-lg px-2.5 py-1.5 text-left text-sm font-medium transition ${
                category === "" ? "bg-primary/10 text-primary" : "text-ink hover:bg-surface"
              }`}
            >
              ทั้งหมด
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => {
                  setCategory(c.slug);
                  apply({ category: c.slug });
                }}
                className={`rounded-lg px-2.5 py-1.5 text-left text-sm font-medium transition ${
                  category === c.slug ? "bg-primary/10 text-primary" : "text-ink hover:bg-surface"
                }`}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          ยี่ห้อรถ
          <select
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              apply({ brand: e.target.value || undefined });
            }}
            className="rounded-lg border border-line bg-white px-2.5 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">ทั้งหมด</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          ช่วงราคา (บาท)
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="0"
            />
            <span className="text-muted">–</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="ไม่จำกัด"
            />
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
          เรียงลำดับ
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              apply({ sort: e.target.value });
            }}
            className="rounded-lg border border-line bg-white px-2.5 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
            className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            กรองสินค้า
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-muted transition hover:bg-surface"
          >
            ล้างตัวกรอง
          </button>
        </div>
      </div>
    </div>
  );
}
