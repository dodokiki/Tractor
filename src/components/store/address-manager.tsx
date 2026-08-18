"use client";

import { useState } from "react";
import type { Address } from "@prisma/client";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

const EMPTY_FORM = {
  recipient: "",
  phone: "",
  line1: "",
  subdistrict: "",
  district: "",
  province: "",
  postcode: "",
};

export function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await res.json()) as ApiResponse<{ address: Address }>;
      if (!json.ok) {
        setError(json.error);
        return;
      }
      setAddresses((prev) => [...prev, json.data.address]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      const json = (await res.json()) as ApiResponse<unknown>;
      if (!json.ok) {
        setError(json.error);
        return;
      }
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {addresses.map((a) => (
        <div
          key={a.id}
          className="flex items-start justify-between gap-3 rounded-xl border border-line p-3 text-sm"
        >
          <div>
            <p className="font-semibold text-ink">
              {a.recipient} · {a.phone}
              {a.isDefault && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  ค่าเริ่มต้น
                </span>
              )}
            </p>
            <p className="text-muted">
              {a.line1} ต.{a.subdistrict} อ.{a.district} จ.{a.province} {a.postcode}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(a.id)}
            disabled={deletingId === a.id}
            className="shrink-0 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
          >
            ลบ
          </button>
        </div>
      ))}

      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-muted">ยังไม่มีที่อยู่จัดส่ง</p>
      )}

      {showForm ? (
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-2 rounded-xl border border-line p-3 sm:grid-cols-2">
          <input
            required
            placeholder="ชื่อผู้รับ"
            value={form.recipient}
            onChange={(e) => updateField("recipient", e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="เบอร์โทร"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="ที่อยู่ (บ้านเลขที่ / ถนน)"
            value={form.line1}
            onChange={(e) => updateField("line1", e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            required
            placeholder="ตำบล/แขวง"
            value={form.subdistrict}
            onChange={(e) => updateField("subdistrict", e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="อำเภอ/เขต"
            value={form.district}
            onChange={(e) => updateField("district", e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="จังหวัด"
            value={form.province}
            onChange={(e) => updateField("province", e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="รหัสไปรษณีย์"
            value={form.postcode}
            onChange={(e) => updateField("postcode", e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          />
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {submitting ? "กำลังบันทึก..." : "บันทึกที่อยู่"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-muted hover:bg-surface"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="self-start rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          + เพิ่มที่อยู่ใหม่
        </button>
      )}
    </div>
  );
}
