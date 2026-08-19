"use client";

import { useState } from "react";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

const MACHINE_TYPES = ["รถขุด", "รถตัก", "รถบด", "แทรกเตอร์", "รถเกี่ยว", "อื่น ๆ"];

const HOTLINE = "02-000-0000";

export function CallForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [machineType, setMachineType] = useState(MACHINE_TYPES[0]);
  const [problem, setProblem] = useState("");
  const [province, setProvince] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, machineType, problem, province: province || undefined }),
      });
      const json = (await res.json()) as ApiResponse<unknown>;
      if (!json.ok) {
        setError(json.error);
        return;
      }
      setDone(true);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง หรือโทรหาเราโดยตรง");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-md ring-1 ring-black/5 sm:p-12">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-4xl" aria-hidden>
          ✅
        </span>
        <h2 className="text-lg font-bold text-ink sm:text-xl">ส่งคำขอเรียกช่างเรียบร้อยแล้ว</h2>
        <p className="text-sm text-muted">ทีมงานจะติดต่อกลับภายใน 24 ชม.</p>
        <a
          href={`tel:${HOTLINE.replace(/-/g, "")}`}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          📞 หรือโทรด่วน {HOTLINE}
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-md ring-1 ring-black/5 sm:p-8"
    >
      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        ชื่อ-นามสกุล
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ชื่อของคุณ"
          className="rounded-xl border border-line px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        เบอร์โทรศัพท์
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0811111111"
          className="rounded-xl border border-line px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        ชนิดเครื่องจักร
        <select
          value={machineType}
          onChange={(e) => setMachineType(e.target.value)}
          className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {MACHINE_TYPES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        อาการ / ปัญหาที่พบ
        <textarea
          required
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          rows={4}
          placeholder="อธิบายอาการเสียหรือสิ่งที่ต้องการให้ช่างช่วยดู"
          className="rounded-xl border border-line px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        จังหวัด <span className="font-normal text-muted">(ถ้ามี)</span>
        <input
          type="text"
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          placeholder="เช่น ขอนแก่น"
          className="rounded-xl border border-line px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </label>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {submitting ? "กำลังส่ง..." : "🔧 ส่งคำขอเรียกช่าง"}
      </button>
      <p className="text-center text-xs text-muted">
        หรือโทรสายด่วน <span className="font-semibold text-ink">{HOTLINE}</span>
      </p>
    </form>
  );
}
