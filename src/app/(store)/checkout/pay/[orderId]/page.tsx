"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckoutSteps } from "@/components/store/checkout-steps";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

type PaymentMethod = "CARD" | "BANK_TRANSFER" | "PROMPTPAY";

type BankInfo = {
  bank?: string;
  accountNo?: string;
  accountName?: string;
  [key: string]: unknown;
};

type PaymentInfo = {
  method: PaymentMethod;
  status: "PAID" | "PENDING";
  qrDataUrl?: string;
  bankInfo?: BankInfo;
};

export default function PayPage() {
  const params = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const orderId = params.orderId;
  const methodFromQuery = (searchParams.get("method") as PaymentMethod | null) ?? "PROMPTPAY";

  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const raw = window.sessionStorage.getItem(`th_payment_${orderId}`);
        if (raw) {
          const parsed = JSON.parse(raw) as PaymentInfo;
          if (!cancelled) {
            setInfo(parsed);
            setLoading(false);
          }
          return;
        }
      } catch {
        // ข้ามไปเรียก init ใหม่
      }

      try {
        const res = await fetch("/api/payments/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, method: methodFromQuery }),
        });
        const json = (await res.json()) as ApiResponse<{
          status: "PAID" | "PENDING";
          qrDataUrl?: string;
          bankInfo?: BankInfo;
        }>;
        if (cancelled) return;
        if (!json.ok) {
          setError(json.error);
        } else {
          setInfo({ method: methodFromQuery, ...json.data });
        }
      } catch {
        if (!cancelled) setError("ไม่สามารถโหลดข้อมูลการชำระเงินได้");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId, methodFromQuery]);

  async function handleNotify() {
    setNotifying(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = (await res.json()) as ApiResponse<unknown>;
      if (!json.ok) {
        setError(json.error);
        setNotifying(false);
        return;
      }
      setNotified(true);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setNotifying(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-3 py-10 text-center sm:px-6">
      <h1 className="text-xl font-bold text-ink">ชำระเงินคำสั่งซื้อ</h1>
      <CheckoutSteps current={2} />

      {loading && <p className="text-sm text-muted">กำลังเตรียมข้อมูลการชำระเงิน...</p>}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {!loading && info && !notified && (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          {info.method === "PROMPTPAY" && info.qrDataUrl && (
            <>
              <div className="flex items-center gap-2 rounded-full bg-[#1e4fa3]/10 px-4 py-1.5">
                <span className="text-lg" aria-hidden>
                  💠
                </span>
                <span className="text-sm font-extrabold tracking-wide text-[#1e4fa3]">
                  PromptPay
                </span>
              </div>
              <p className="text-sm text-muted">สแกน QR ด้วยแอปธนาคารเพื่อชำระเงิน</p>
              <div className="rounded-2xl border-2 border-line bg-white p-4 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={info.qrDataUrl}
                  alt="PromptPay QR"
                  className="h-56 w-56 object-contain"
                />
              </div>
            </>
          )}

          {info.method === "BANK_TRANSFER" && info.bankInfo && (
            <div className="w-full rounded-xl bg-surface p-4 text-left text-sm">
              <p className="mb-2 font-semibold text-ink">โอนเงินเข้าบัญชีธนาคาร</p>
              {info.bankInfo.bank && (
                <p>
                  <span className="text-muted">ธนาคาร:</span> {info.bankInfo.bank}
                </p>
              )}
              {info.bankInfo.accountNo && (
                <p>
                  <span className="text-muted">เลขบัญชี:</span> {info.bankInfo.accountNo}
                </p>
              )}
              {info.bankInfo.accountName && (
                <p>
                  <span className="text-muted">ชื่อบัญชี:</span> {info.bankInfo.accountName}
                </p>
              )}
            </div>
          )}

          {info.method === "CARD" && (
            <p className="text-sm text-muted">กำลังดำเนินการชำระเงินด้วยบัตร...</p>
          )}

          <button
            type="button"
            onClick={handleNotify}
            disabled={notifying}
            className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {notifying ? "กำลังส่ง..." : "✅ แจ้งชำระเงินแล้ว"}
          </button>
          <Link href={`/orders/${orderId}`} className="text-xs text-muted hover:underline">
            ดูรายละเอียดคำสั่งซื้อ
          </Link>
        </div>
      )}

      {notified && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <span className="text-4xl" aria-hidden>⏳</span>
          <p className="text-base font-bold text-ink">ได้รับการแจ้งชำระเงินแล้ว</p>
          <p className="text-sm text-muted">รอเจ้าหน้าที่ตรวจสอบยอดโอน ระบบจะอัปเดตสถานะให้อัตโนมัติ</p>
          <Link
            href={`/orders/${orderId}`}
            className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
          >
            ไปที่คำสั่งซื้อของฉัน
          </Link>
        </div>
      )}
    </div>
  );
}
