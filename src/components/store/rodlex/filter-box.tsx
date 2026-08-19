"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type QuickFilter = { label: string; params: Record<string, string | undefined> };
export type CategoryOption = { value: string; label: string };

/**
 * กล่องตัวกรอง/ค้นหาด้านขวาบน ใช้ทั้งหน้าทีมช่างและร้านอะไหล่
 * ปุ่มลัด + dropdown หมวด (ถ้ามี) + ช่องค้นหา → กด "ค้นหา" แล้ว push query ไป basePath
 * (การมี query ใด ๆ ทำให้หน้าเปลี่ยนไปโหมด "รายการรวม" ที่มีเพจจิเนชันจริง)
 */
export function FilterBox({
  basePath,
  title,
  quickFilters,
  categoryOptions,
  searchPlaceholder,
  initial,
}: {
  basePath: string;
  title: string;
  quickFilters: QuickFilter[];
  categoryOptions?: CategoryOption[];
  searchPlaceholder: string;
  initial: { q?: string; category?: string };
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q ?? "");
  const [category, setCategory] = useState(initial.category ?? "");

  function go(extra: Record<string, string | undefined> = {}) {
    const merged: Record<string, string | undefined> = { q, category, ...extra };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
      <p className="text-xs font-bold text-muted">{title}</p>

      <div className="flex flex-col gap-1.5">
        {quickFilters.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => go(f.params)}
            className="rounded-full bg-surface px-3.5 py-2 text-left text-xs font-semibold text-ink ring-1 ring-line transition hover:bg-[#1B7A43]/10 hover:text-[#1B7A43] hover:ring-[#1B7A43]/30 sm:text-sm"
          >
            {f.label}
          </button>
        ))}
      </div>

      {categoryOptions && (
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7A43] sm:text-sm"
        >
          <option value="">ทุกหมวดเครื่องจักร</option>
          {categoryOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      )}

      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && go()}
        placeholder={searchPlaceholder}
        className="rounded-full border border-line bg-white px-3.5 py-2 text-xs text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7A43] sm:text-sm"
      />

      <button
        type="button"
        onClick={() => go()}
        className="rounded-full bg-gradient-to-r from-[#8CC63F] to-[#1B7A43] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7A43] focus-visible:ring-offset-2"
      >
        ค้นหา
      </button>
    </div>
  );
}
