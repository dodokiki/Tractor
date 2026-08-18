"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddVehicleForm() {
  const router = useRouter();
  const [refCode, setRefCode] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plateNo, setPlateNo] = useState("");
  const [mileageKm, setMileageKm] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!refCode.trim()) {
      setError("กรุณากรอกรหัสอ้างอิงรถ (refCode)");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refCode: refCode.trim(),
          brand: brand.trim() || null,
          model: model.trim() || null,
          plateNo: plateNo.trim() || null,
          mileageKm: mileageKm ? Number(mileageKm) : null,
          ownerPhone: ownerPhone.trim() || null,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "เพิ่มรถไม่สำเร็จ");
        return;
      }
      setRefCode("");
      setBrand("");
      setModel("");
      setPlateNo("");
      setMileageKm("");
      setOwnerPhone("");
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
        <label className="text-xs text-muted">รหัสอ้างอิง (refCode)</label>
        <input
          value={refCode}
          onChange={(e) => setRefCode(e.target.value)}
          className="w-32 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="TR-0001"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">ยี่ห้อ</label>
        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-32 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="Kubota"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">รุ่น</label>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-32 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="L3408"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">ทะเบียน</label>
        <input
          value={plateNo}
          onChange={(e) => setPlateNo(e.target.value)}
          className="w-28 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">เลขไมล์ (กม.)</label>
        <input
          type="number"
          value={mileageKm}
          onChange={(e) => setMileageKm(e.target.value)}
          className="w-24 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">เบอร์เจ้าของ</label>
        <input
          value={ownerPhone}
          onChange={(e) => setOwnerPhone(e.target.value)}
          className="w-32 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="08xxxxxxxx"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
      >
        {loading ? "กำลังเพิ่ม..." : "+ เพิ่มรถ"}
      </button>
      {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
    </form>
  );
}
