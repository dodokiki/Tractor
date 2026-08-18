import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

/** สร้าง QR PromptPay จริง (มาตรฐาน EMVCo) เป็น data URL สำหรับแสดงผล */
export async function promptPayQrDataUrl(amountSatang: number): Promise<string> {
  const id = process.env.PROMPTPAY_ID || "0800000000";
  const payload = generatePayload(id, { amount: amountSatang / 100 });
  return QRCode.toDataURL(payload, { width: 320, margin: 1 });
}

/**
 * โหมดชำระเงิน:
 * - "mock" (dev): บัตรเครดิตสำเร็จอัตโนมัติ, PromptPay/โอนเงิน ยืนยันด้วยปุ่มแจ้งชำระ + แอดมินตรวจ
 * - โปรดักชัน: สลับไปเรียก Omise / 2C2P / GB Prime Pay ที่ชั้นนี้ชั้นเดียว
 */
export function isMockPayment(): boolean {
  return (process.env.PAYMENT_MODE || "mock") === "mock";
}

export function newOrderCode(): string {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `TH-${n}`;
}
