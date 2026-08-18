"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bahtToSatang, formatBaht } from "@/lib/money";

export default function WithdrawForm({ balanceSatang }: { balanceSatang: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountSatang = bahtToSatang(Number(amount));
    if (!amount || amountSatang <= 0) {
      setError("กรุณากรอกจำนวนเงินให้ถูกต้อง");
      return;
    }
    if (amountSatang > balanceSatang) {
      setError("จำนวนเงินเกินยอดคงเหลือ");
      return;
    }
    if (!bank.trim() || !accountNo.trim() || !accountName.trim()) {
      setError("กรุณากรอกข้อมูลบัญชีธนาคารให้ครบ");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/vendor/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountSatang,
          bank: bank.trim(),
          accountNo: accountNo.trim(),
          accountName: accountName.trim(),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "ส่งคำขอถอนเงินไม่สำเร็จ");
        return;
      }
      setSuccess("ส่งคำขอถอนเงินเรียบร้อยแล้ว รอแอดมินอนุมัติ");
      setAmount("");
      setBank("");
      setAccountNo("");
      setAccountName("");
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
        <label className="text-xs text-muted">จำนวนเงิน (บาท)</label>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-32 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">ธนาคาร</label>
        <input
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          placeholder="กสิกรไทย"
          className="w-36 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">เลขบัญชี</label>
        <input
          value={accountNo}
          onChange={(e) => setAccountNo(e.target.value)}
          className="w-40 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">ชื่อบัญชี</label>
        <input
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className="w-40 rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
      >
        {loading ? "กำลังส่งคำขอ..." : "ขอถอนเงิน"}
      </button>
      <div className="w-full text-xs text-muted">
        ยอดถอนได้สูงสุด {formatBaht(balanceSatang)}
      </div>
      {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
      {success ? <p className="w-full text-xs text-primary">{success}</p> : null}
    </form>
  );
}
