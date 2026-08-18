"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddBannerForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [sort, setSort] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("กรุณากรอกหัวข้อแบนเนอร์");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          ctaText: ctaText.trim() || null,
          ctaHref: ctaHref.trim() || null,
          sort: Number(sort) || 0,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "เพิ่มแบนเนอร์ไม่สำเร็จ");
        return;
      }
      setTitle("");
      setSubtitle("");
      setCtaText("");
      setCtaHref("");
      setSort("0");
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
        <label className="text-xs text-muted">หัวข้อ</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-48 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="โปรโมชันประจำเดือน"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">คำอธิบายย่อย</label>
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-48 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">ข้อความปุ่ม</label>
        <input
          value={ctaText}
          onChange={(e) => setCtaText(e.target.value)}
          className="w-32 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="ช้อปเลย"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">ลิงก์ปุ่ม</label>
        <input
          value={ctaHref}
          onChange={(e) => setCtaHref(e.target.value)}
          className="w-40 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="/products"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">ลำดับ</label>
        <input
          type="number"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-20 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
      >
        {loading ? "กำลังเพิ่ม..." : "+ เพิ่มแบนเนอร์"}
      </button>
      {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
    </form>
  );
}
