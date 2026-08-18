"use client";

import { useState } from "react";
import type { Category } from "@prisma/client";

export type ProductFormValues = {
  name: string;
  categoryId: string;
  sku: string;
  brand: string;
  priceBaht: string;
  stock: string;
  emoji: string;
  from: string;
  to: string;
  description: string;
};

export const EMPTY_PRODUCT_VALUES: ProductFormValues = {
  name: "",
  categoryId: "",
  sku: "",
  brand: "",
  priceBaht: "",
  stock: "0",
  emoji: "🔩",
  from: "#1B7A43",
  to: "#2FA55C",
  description: "",
};

export default function ProductFormFields({
  categories,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  categories: Category[];
  initial: ProductFormValues;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<{ ok: boolean; error?: string }>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof ProductFormValues>(key: K, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim() || !values.categoryId || !values.priceBaht) {
      setError("กรุณากรอกชื่อสินค้า หมวดหมู่ และราคา");
      return;
    }
    setLoading(true);
    setError("");
    const result = await onSubmit(values);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "บันทึกไม่สำเร็จ");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Field label="ชื่อสินค้า">
          <input
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="หมวดหมู่">
          <select
            value={values.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className="input"
          >
            <option value="">เลือกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="รหัสสินค้า (SKU)">
          <input
            value={values.sku}
            onChange={(e) => set("sku", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="แบรนด์ (ถ้ามี)">
          <input
            value={values.brand}
            onChange={(e) => set("brand", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="ราคา (บาท)">
          <input
            type="number"
            min={0}
            value={values.priceBaht}
            onChange={(e) => set("priceBaht", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="สต็อก">
          <input
            type="number"
            min={0}
            value={values.stock}
            onChange={(e) => set("stock", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Emoji สินค้า">
          <input
            value={values.emoji}
            onChange={(e) => set("emoji", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="สีไล่ระดับ">
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={values.from}
              onChange={(e) => set("from", e.target.value)}
              className="h-9 w-9 rounded border border-line"
            />
            <input
              type="color"
              value={values.to}
              onChange={(e) => set("to", e.target.value)}
              className="h-9 w-9 rounded border border-line"
            />
            <div
              className="h-9 w-9 rounded-lg text-center text-lg leading-9"
              style={{ background: `linear-gradient(135deg, ${values.from}, ${values.to})` }}
            >
              {values.emoji}
            </div>
          </div>
        </Field>
      </div>
      <Field label="รายละเอียดสินค้า (ถ้ามี)">
        <textarea
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          className="input"
        />
      </Field>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
        >
          {loading ? "กำลังบันทึก..." : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-line px-4 py-2 text-sm text-ink hover:bg-surface"
          >
            ยกเลิก
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--color-line);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}
