"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CommissionEditor({
  vendorId,
  commissionBps,
}: {
  vendorId: string;
  commissionBps: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState((commissionBps / 100).toString());
  const [loading, setLoading] = useState(false);
  const dirty = Number(value) !== commissionBps / 100;

  async function save() {
    const pct = Number(value);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      alert("กรุณากรอกเปอร์เซ็นต์คอมมิชชันระหว่าง 0-100");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionBps: Math.round(pct * 100) }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        alert(json?.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      router.refresh();
    } catch {
      alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        max={100}
        step={0.1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-16 rounded-lg border border-line px-2 py-1 text-sm focus:border-primary focus:outline-none"
      />
      <span className="text-xs text-muted">%</span>
      {dirty ? (
        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-white hover:bg-primary-light disabled:opacity-50"
        >
          {loading ? "..." : "บันทึก"}
        </button>
      ) : null}
    </div>
  );
}
