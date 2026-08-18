"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Address } from "@prisma/client";
import { formatBaht } from "@/lib/money";
import { useCart } from "./cart-context";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

type PaymentMethod = "CARD" | "BANK_TRANSFER" | "PROMPTPAY";

const NEW_ADDRESS = "__new__";

export function CheckoutForm({ addresses }: { addresses: Address[] }) {
  const { items, couponCode, totalSatang, clear, isReady } = useCart();
  const router = useRouter();

  const [addressMode, setAddressMode] = useState(
    addresses.length > 0 ? addresses[0].id : NEW_ADDRESS,
  );
  const [newAddress, setNewAddress] = useState({
    recipient: "",
    phone: "",
    line1: "",
    subdistrict: "",
    district: "",
    province: "",
    postcode: "",
  });
  const [method, setMethod] = useState<PaymentMethod>("PROMPTPAY");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isReady && items.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-muted">ตะกร้าของคุณว่างเปล่า ไม่สามารถชำระเงินได้</p>
      </div>
    );
  }

  function updateNewAddress(field: keyof typeof newAddress, value: string) {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (addressMode === NEW_ADDRESS) {
      const required: (keyof typeof newAddress)[] = [
        "recipient",
        "phone",
        "line1",
        "subdistrict",
        "district",
        "province",
        "postcode",
      ];
      if (required.some((f) => !newAddress[f].trim())) {
        setError("กรุณากรอกที่อยู่จัดส่งให้ครบทุกช่อง");
        return;
      }
    }

    setSubmitting(true);
    try {
      const orderBody: Record<string, unknown> = {
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        couponCode: couponCode || undefined,
      };
      if (addressMode === NEW_ADDRESS) {
        orderBody.address = newAddress;
      } else {
        orderBody.addressId = addressMode;
      }

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderBody),
      });
      const orderJson = (await orderRes.json()) as ApiResponse<{
        orderId: string;
        code: string;
        totalSatang: number;
      }>;
      if (!orderJson.ok) {
        setError(orderJson.error);
        setSubmitting(false);
        return;
      }
      const { orderId } = orderJson.data;

      const payRes = await fetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, method }),
      });
      const payJson = (await payRes.json()) as ApiResponse<{
        status: "PAID" | "PENDING";
        qrDataUrl?: string;
        bankInfo?: unknown;
      }>;
      if (!payJson.ok) {
        setError(payJson.error);
        setSubmitting(false);
        return;
      }

      clear();

      if (payJson.data.status === "PAID") {
        router.push(`/orders/${orderId}?success=1`);
        return;
      }

      try {
        window.sessionStorage.setItem(
          `th_payment_${orderId}`,
          JSON.stringify({ method, ...payJson.data }),
        );
      } catch {
        // sessionStorage อาจใช้ไม่ได้ในบางสภาพแวดล้อม — หน้า pay จะเรียก init ใหม่แทน
      }
      router.push(`/checkout/pay/${orderId}?method=${method}`);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
        <h2 className="mb-3 text-sm font-bold text-ink">ที่อยู่จัดส่ง</h2>
        <div className="flex flex-col gap-2">
          {addresses.map((a) => (
            <label
              key={a.id}
              className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-sm ${
                addressMode === a.id ? "border-primary bg-primary/5" : "border-line"
              }`}
            >
              <input
                type="radio"
                name="address"
                checked={addressMode === a.id}
                onChange={() => setAddressMode(a.id)}
                className="mt-1"
              />
              <span>
                <span className="font-semibold text-ink">
                  {a.recipient} · {a.phone}
                </span>
                <br />
                <span className="text-muted">
                  {a.line1} ต.{a.subdistrict} อ.{a.district} จ.{a.province} {a.postcode}
                </span>
              </span>
            </label>
          ))}

          <label
            className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${
              addressMode === NEW_ADDRESS ? "border-primary bg-primary/5" : "border-line"
            }`}
          >
            <input
              type="radio"
              name="address"
              checked={addressMode === NEW_ADDRESS}
              onChange={() => setAddressMode(NEW_ADDRESS)}
            />
            <span className="font-semibold text-ink">+ กรอกที่อยู่ใหม่</span>
          </label>
        </div>

        {addressMode === NEW_ADDRESS && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              placeholder="ชื่อผู้รับ"
              value={newAddress.recipient}
              onChange={(e) => updateNewAddress("recipient", e.target.value)}
              className="rounded-lg border border-line px-3 py-2 text-sm"
            />
            <input
              placeholder="เบอร์โทรผู้รับ"
              value={newAddress.phone}
              onChange={(e) => updateNewAddress("phone", e.target.value)}
              className="rounded-lg border border-line px-3 py-2 text-sm"
            />
            <input
              placeholder="ที่อยู่ (บ้านเลขที่ / ถนน)"
              value={newAddress.line1}
              onChange={(e) => updateNewAddress("line1", e.target.value)}
              className="rounded-lg border border-line px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              placeholder="ตำบล/แขวง"
              value={newAddress.subdistrict}
              onChange={(e) => updateNewAddress("subdistrict", e.target.value)}
              className="rounded-lg border border-line px-3 py-2 text-sm"
            />
            <input
              placeholder="อำเภอ/เขต"
              value={newAddress.district}
              onChange={(e) => updateNewAddress("district", e.target.value)}
              className="rounded-lg border border-line px-3 py-2 text-sm"
            />
            <input
              placeholder="จังหวัด"
              value={newAddress.province}
              onChange={(e) => updateNewAddress("province", e.target.value)}
              className="rounded-lg border border-line px-3 py-2 text-sm"
            />
            <input
              placeholder="รหัสไปรษณีย์"
              value={newAddress.postcode}
              onChange={(e) => updateNewAddress("postcode", e.target.value)}
              className="rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
        <h2 className="mb-3 text-sm font-bold text-ink">วิธีชำระเงิน</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {(
            [
              { value: "PROMPTPAY", label: "📱 พร้อมเพย์ (QR)" },
              { value: "BANK_TRANSFER", label: "🏦 โอนผ่านธนาคาร" },
              { value: "CARD", label: "💳 บัตรเครดิต/เดบิต" },
            ] as { value: PaymentMethod; label: string }[]
          ).map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${
                method === opt.value ? "border-primary bg-primary/5" : "border-line"
              }`}
            >
              <input
                type="radio"
                name="method"
                checked={method === opt.value}
                onChange={() => setMethod(opt.value)}
              />
              <span className="font-medium text-ink">{opt.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">ยอดรวมสินค้า</span>
          <span className="font-semibold text-ink">{formatBaht(totalSatang)}</span>
        </div>
        {couponCode && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">โค้ดส่วนลด</span>
            <span className="font-semibold text-ink">{couponCode}</span>
          </div>
        )}
        <p className="text-xs text-muted">ยอดสุทธิและส่วนลดจะคำนวณจริงหลังกดยืนยันคำสั่งซื้อ</p>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {submitting ? "กำลังยืนยัน..." : "ยืนยันคำสั่งซื้อ"}
        </button>
      </section>
    </form>
  );
}
