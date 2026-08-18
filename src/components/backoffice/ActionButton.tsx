"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Variant = "primary" | "outline" | "danger" | "ghost";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-light",
  outline: "border border-line text-ink hover:bg-surface",
  danger: "bg-red-50 text-red-600 hover:bg-red-100",
  ghost: "text-primary hover:underline",
};

export default function ActionButton({
  url,
  method = "POST",
  body,
  getBody,
  confirmMessage,
  label,
  className = "",
  variant = "primary",
  disabled = false,
}: {
  url: string;
  method?: "POST" | "PATCH" | "DELETE";
  /** ค่าคงที่ที่จะส่งเป็น JSON body */
  body?: unknown;
  /** เรียกก่อนยิง request เพื่อขอข้อมูลเพิ่ม (เช่น window.prompt) — คืนค่า null เพื่อยกเลิก */
  getBody?: () => unknown | null;
  confirmMessage?: string;
  label: React.ReactNode;
  className?: string;
  variant?: Variant;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    let payload = body;
    if (getBody) {
      const result = getBody();
      if (result === null) return;
      payload = result;
    }
    setLoading(true);
    try {
      const res = await fetch(url, {
        method,
        headers: payload !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: payload !== undefined ? JSON.stringify(payload) : undefined,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        alert(json?.error ?? "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
        return;
      }
      router.refresh();
    } catch {
      alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS[variant]} ${className}`}
    >
      {loading ? "กำลังบันทึก..." : label}
    </button>
  );
}
