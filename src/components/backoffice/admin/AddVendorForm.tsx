"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddVendorForm() {
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shopName.trim() || !ownerName.trim() || !phone.trim()) {
      setError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, ownerName, phone }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "เพิ่มร้านค้าไม่สำเร็จ");
        return;
      }
      setShopName("");
      setOwnerName("");
      setPhone("");
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
        <label className="text-xs text-muted">ชื่อร้านค้า</label>
        <input
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          className="w-44 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="ร้านอะไหล่..."
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">ชื่อเจ้าของร้าน</label>
        <input
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          className="w-40 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="ชื่อ-นามสกุล"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">เบอร์โทร</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-36 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="08xxxxxxxx"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
      >
        {loading ? "กำลังเพิ่ม..." : "+ เพิ่มร้านค้า"}
      </button>
      {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
    </form>
  );
}
