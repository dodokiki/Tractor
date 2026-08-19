"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PillButton, PillLink } from "@/components/store/rodlex/pill";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

export function ReplyForm({ threadId, loggedIn }: { threadId: string; loggedIn: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loggedIn) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-4">
        <p className="text-sm text-muted">เข้าสู่ระบบเพื่อร่วมตอบกระทู้นี้</p>
        <PillLink href={`/login?next=/forum/${threadId}`}>เข้าสู่ระบบ</PillLink>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/forum/${threadId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = (await res.json()) as ApiResponse<unknown>;
      if (!json.ok) {
        setError(json.error);
        return;
      }
      setBody("");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <textarea
        required
        placeholder="พิมพ์คำตอบของคุณ..."
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="rounded-2xl border border-line px-4 py-2.5 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7A43]"
      />
      <PillButton type="submit" disabled={submitting} className="self-start">
        {submitting ? "กำลังส่ง..." : "ส่งคำตอบ"}
      </PillButton>
    </form>
  );
}
