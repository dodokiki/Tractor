"use client";

import { useEffect, useState } from "react";

export const CART_TOAST_EVENT = "tractorhub:cart-toast";

/** เรียกจากทุกที่ (client component) เพื่อขึ้น toast มุมขวาล่างยืนยันการหยิบใส่ตะกร้า */
export function fireCartToast(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CART_TOAST_EVENT, { detail: message }));
}

/** ตัวแสดง toast ระดับหน้าเว็บ — mount ครั้งเดียวใน layout */
export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let clearTimer: ReturnType<typeof setTimeout> | undefined;

    function onToast(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
      setMessage(detail);
      setVisible(true);
      hideTimer = setTimeout(() => setVisible(false), 2500);
      clearTimer = setTimeout(() => setMessage(null), 2900);
    }

    window.addEventListener(CART_TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(CART_TOAST_EVENT, onToast);
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, []);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-50 flex max-w-xs items-center gap-2.5 rounded-2xl bg-primary-dark px-4 py-3 text-sm font-medium text-white shadow-xl ring-1 ring-black/10 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <span
        aria-hidden
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm"
      >
        ✓
      </span>
      {message}
    </div>
  );
}
