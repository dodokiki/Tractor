"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = (await res.json()) as ApiResponse<{ sent: boolean; devCode?: string }>;
      if (!json.ok) {
        setError(json.error);
        return;
      }
      setDevCode(json.data.devCode ?? null);
      setStep("otp");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, name: name || undefined }),
      });
      const json = (await res.json()) as ApiResponse<{ user: unknown }>;
      if (!json.ok) {
        setError(json.error);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-3 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-4xl" aria-hidden>🚜</p>
        <h1 className="mt-2 text-xl font-bold text-ink">เข้าสู่ระบบ TractorHub</h1>
        <p className="text-sm text-muted">เข้าสู่ระบบด้วยเบอร์โทรศัพท์ ไม่ต้องใช้รหัสผ่าน</p>
      </div>

      {step === "phone" ? (
        <form onSubmit={handleRequestOtp} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            เบอร์โทรศัพท์
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0811111111"
              className="rounded-lg border border-line px-3 py-2.5 text-sm"
            />
          </label>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? "กำลังส่ง..." : "ขอรหัส OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-muted">
            ส่งรหัส OTP ไปยัง <span className="font-semibold text-ink">{phone}</span> แล้ว
          </p>
          {devCode && (
            <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm font-semibold text-accent-dark">
              โหมดทดสอบ: รหัส OTP คือ {devCode}
            </p>
          )}
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            รหัส OTP
            <input
              type="text"
              inputMode="numeric"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="rounded-lg border border-line px-3 py-2.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            ชื่อ-นามสกุล <span className="font-normal text-muted">(สำหรับผู้ใช้ใหม่)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อของคุณ"
              className="rounded-lg border border-line px-3 py-2.5 text-sm"
            />
          </label>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? "กำลังตรวจสอบ..." : "ยืนยันและเข้าสู่ระบบ"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setCode("");
              setError(null);
            }}
            className="text-xs text-muted hover:underline"
          >
            ← เปลี่ยนเบอร์โทรศัพท์
          </button>
        </form>
      )}

      <p className="text-center text-xs text-muted">
        <Link href="/" className="hover:underline">
          ← กลับหน้าแรก
        </Link>
      </p>
    </div>
  );
}
