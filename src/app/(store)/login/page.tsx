"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { OtpInput } from "@/components/store/otp-input";

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
    <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col justify-center gap-6 px-3 py-12 sm:px-6">
      {step === "phone" ? (
        <form
          onSubmit={handleRequestOtp}
          className="grid grid-cols-1 items-center gap-6 rounded-3xl bg-white p-6 shadow-md ring-1 ring-black/5 sm:grid-cols-[1fr_auto] sm:gap-10 sm:p-10"
        >
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-xl font-bold text-ink sm:text-2xl">เข้าสู่ระบบ Rodlex</h1>
              <p className="mt-1 text-sm text-muted">เข้าสู่ระบบด้วยเบอร์โทรศัพท์ ไม่ต้องใช้รหัสผ่าน</p>
            </div>

            <label className="flex flex-col gap-1 text-sm font-medium text-ink">
              เบอร์โทรศัพท์
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0811111111"
                className="rounded-xl border border-line px-4 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {loading ? "กำลังส่ง..." : "ขอรหัส OTP"}
            </button>

            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-line" aria-hidden />
              หรือ
              <span className="h-px flex-1 bg-line" aria-hidden />
            </div>

            <div className="flex justify-center gap-4">
              <button
                type="button"
                disabled
                title="เร็ว ๆ นี้"
                aria-label="เข้าสู่ระบบด้วย Google (เร็ว ๆ นี้)"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg shadow-sm ring-1 ring-line disabled:cursor-not-allowed disabled:opacity-50"
              >
                🇬
              </button>
              <button
                type="button"
                disabled
                title="เร็ว ๆ นี้"
                aria-label="เข้าสู่ระบบด้วย Facebook (เร็ว ๆ นี้)"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg shadow-sm ring-1 ring-line disabled:cursor-not-allowed disabled:opacity-50"
              >
                🅵
              </button>
            </div>
          </div>

          <div className="hidden justify-self-end sm:flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/rodlex-logo.png" alt="Rodlex รถเหล็ก" className="h-24 w-auto" />
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleVerify}
          className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white p-5 shadow-md ring-1 ring-black/5 sm:p-6"
        >
          <p className="text-center text-sm text-muted">
            ส่งรหัส OTP ไปยัง <span className="font-semibold text-ink">{phone}</span> แล้ว
          </p>

          {devCode && (
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800">
              <p>โหมดทดสอบ: รหัสคือ</p>
              <p className="mt-1 text-lg font-extrabold tracking-[0.3em]">{devCode}</p>
            </div>
          )}

          <OtpInput value={code} onChange={setCode} />

          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            ชื่อ-นามสกุล <span className="font-normal text-muted">(สำหรับผู้ใช้ใหม่)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อของคุณ"
              className="rounded-lg border border-line px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
            className="text-center text-xs text-muted hover:text-primary hover:underline"
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
