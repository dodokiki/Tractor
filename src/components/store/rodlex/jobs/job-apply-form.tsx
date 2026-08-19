"use client";

import { useState } from "react";
import { fireCartToast } from "@/components/store/toast-host";
import { PillButton } from "@/components/store/rodlex/pill";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

/** ปุ่ม "สมัครงานนี้" เปิดฟอร์มสมัครแบบ inline ใต้การ์ดตำแหน่งงาน */
export function JobApplyForm({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, note }),
      });
      const json = (await res.json()) as ApiResponse<unknown>;
      if (!json.ok) {
        setError(json.error);
        return;
      }
      setDone(true);
      setOpen(false);
      setName("");
      setPhone("");
      setNote("");
      fireCartToast("ส่งใบสมัครสำเร็จ ทีมงานจะติดต่อกลับโดยเร็ว");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <p className="rounded-full bg-[#1B7A43]/10 px-4 py-2 text-sm font-semibold text-[#1B7A43]">
        ✓ ส่งใบสมัครแล้ว ทีมงานจะติดต่อกลับใน 24 ชม.
      </p>
    );
  }

  if (!open) {
    return (
      <PillButton type="button" onClick={() => setOpen(true)}>
        สมัครงานนี้
      </PillButton>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-2xl bg-surface p-3 ring-1 ring-line"
    >
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <input
        required
        placeholder="ชื่อ-นามสกุล"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-full border border-line bg-white px-3.5 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7A43]"
      />
      <input
        required
        placeholder="เบอร์โทรศัพท์"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="rounded-full border border-line bg-white px-3.5 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7A43]"
      />
      <textarea
        placeholder="ข้อความถึงทีมงาน (ไม่บังคับ)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        className="rounded-2xl border border-line bg-white px-3.5 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7A43]"
      />
      <div className="flex gap-2">
        <PillButton type="submit" disabled={submitting}>
          {submitting ? "กำลังส่ง..." : "ส่งใบสมัคร"}
        </PillButton>
        <PillButton type="button" variant="outline" onClick={() => setOpen(false)}>
          ยกเลิก
        </PillButton>
      </div>
    </form>
  );
}
