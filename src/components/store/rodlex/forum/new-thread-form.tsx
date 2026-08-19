"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ForumCategory } from "@prisma/client";
import { PillButton, PillLink } from "@/components/store/rodlex/pill";
import { GradientTile } from "../gradient-tile";
import type { TileImage } from "../image";
import { FORUM_CATEGORY_LABEL, FORUM_IMAGE_PALETTE } from "./constants";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

const MAX_IMAGES = 4;

/** ปุ่ม "ตั้งกระทู้" — ไม่ login พาไป /login, login แล้วกดเปิดฟอร์มตั้งกระทู้แบบการ์ด */
export function NewThreadForm({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<ForumCategory>("REPAIR");
  const [selected, setSelected] = useState<TileImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleImage(img: TileImage) {
    setSelected((prev) => {
      const exists = prev.some((p) => p.emoji === img.emoji);
      if (exists) return prev.filter((p) => p.emoji !== img.emoji);
      if (prev.length >= MAX_IMAGES) return prev;
      return [...prev, img];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, category, images: selected }),
      });
      const json = (await res.json()) as ApiResponse<unknown>;
      if (!json.ok) {
        setError(json.error);
        return;
      }
      setTitle("");
      setBody("");
      setCategory("REPAIR");
      setSelected([]);
      setOpen(false);
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  if (!loggedIn) {
    return (
      <PillLink href="/login?next=/forum" className="self-start sm:self-auto">
        ตั้งกระทู้
      </PillLink>
    );
  }

  if (!open) {
    return (
      <PillButton type="button" onClick={() => setOpen(true)} className="self-start sm:self-auto">
        ตั้งกระทู้
      </PillButton>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-[#1B7A43]">ตั้งกระทู้ใหม่</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-muted hover:text-ink"
        >
          ปิด
        </button>
      </div>

      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

      <input
        required
        placeholder="หัวเรื่อง"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-full border border-line px-4 py-2.5 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7A43]"
      />
      <textarea
        required
        placeholder="เพิ่มข้อความในส่วนเนื้อหาหน่อยน้อย"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="rounded-2xl border border-line px-4 py-2.5 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7A43]"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as ForumCategory)}
        className="w-fit rounded-full border border-line px-4 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7A43]"
      >
        {Object.entries(FORUM_CATEGORY_LABEL).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-muted">
          เลือกภาพประกอบ (สูงสุด {MAX_IMAGES} รูป) — {selected.length}/{MAX_IMAGES}
        </p>
        <div className="flex flex-wrap gap-2">
          {FORUM_IMAGE_PALETTE.map((img) => {
            const isSelected = selected.some((s) => s.emoji === img.emoji);
            return (
              <button
                key={img.emoji}
                type="button"
                onClick={() => toggleImage(img)}
                title={img.label}
                className={`rounded-xl p-0.5 transition ${
                  isSelected ? "ring-2 ring-[#1B7A43]" : "ring-1 ring-line hover:ring-[#1B7A43]/40"
                }`}
              >
                <GradientTile image={img} size="sm" rounded="rounded-lg" className="h-12 w-12" />
              </button>
            );
          })}
        </div>
      </div>

      <PillButton type="submit" disabled={submitting} className="self-start">
        {submitting ? "กำลังตั้งกระทู้..." : "ตั้งกระทู้"}
      </PillButton>
    </form>
  );
}
