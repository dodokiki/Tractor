"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bahtToSatang } from "@/lib/money";

export default function AddCouponForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [value, setValue] = useState("");
  const [minTotal, setMinTotal] = useState("0");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !value) {
      setError("กรุณากรอกรหัสคูปองและมูลค่าส่วนลด");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          type,
          value: type === "PERCENT" ? Number(value) : bahtToSatang(Number(value)),
          minTotalSatang: bahtToSatang(Number(minTotal || 0)),
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "เพิ่มคูปองไม่สำเร็จ");
        return;
      }
      setCode("");
      setValue("");
      setMinTotal("0");
      setExpiresAt("");
      router.refresh();
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">รหัสคูปอง</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-32 rounded-lg border border-line px-3 py-2 text-sm uppercase focus:border-primary focus:outline-none"
          placeholder="SAVE100"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">ประเภท</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "PERCENT" | "FIXED")}
          className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
          <option value="FIXED">จำนวนเงิน (บาท)</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">มูลค่า ({type === "PERCENT" ? "%" : "บาท"})</label>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">ยอดขั้นต่ำ (บาท)</label>
        <input
          type="number"
          min={0}
          value={minTotal}
          onChange={(e) => setMinTotal(e.target.value)}
          className="w-28 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">วันหมดอายุ (ถ้ามี)</label>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
      >
        {loading ? "กำลังเพิ่ม..." : "+ เพิ่มคูปอง"}
      </button>
      {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
    </form>
  );
}
