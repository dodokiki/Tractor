type ChipTone = "green" | "orange" | "gray" | "red" | "blue";

const TONE_CLASS: Record<ChipTone, string> = {
  green: "bg-primary/10 text-primary",
  orange: "bg-accent/10 text-accent-dark",
  gray: "bg-line text-muted",
  red: "bg-red-100 text-red-600",
  blue: "bg-blue-100 text-blue-600",
};

const ORDER_STATUS: Record<string, { label: string; tone: ChipTone }> = {
  PENDING_PAYMENT: { label: "รอชำระเงิน", tone: "orange" },
  PAID: { label: "ชำระแล้ว", tone: "blue" },
  COMPLETED: { label: "สำเร็จ", tone: "green" },
  CANCELLED: { label: "ยกเลิก", tone: "gray" },
  REFUNDED: { label: "คืนเงิน", tone: "red" },
};

const SUBORDER_STATUS: Record<string, { label: string; tone: ChipTone }> = {
  AWAITING_PAYMENT: { label: "รอชำระเงิน", tone: "orange" },
  PENDING_CONFIRM: { label: "รอร้านยืนยัน", tone: "orange" },
  CONFIRMED: { label: "ยืนยันแล้ว", tone: "blue" },
  SHIPPED: { label: "จัดส่งแล้ว", tone: "blue" },
  COMPLETED: { label: "สำเร็จ", tone: "green" },
  CANCELLED: { label: "ยกเลิก", tone: "gray" },
};

const PAYMENT_STATUS: Record<string, { label: string; tone: ChipTone }> = {
  PENDING: { label: "รอตรวจสอบ", tone: "orange" },
  PAID: { label: "ชำระแล้ว", tone: "green" },
  FAILED: { label: "ล้มเหลว", tone: "red" },
  REFUNDED: { label: "คืนเงิน", tone: "gray" },
};

const WITHDRAWAL_STATUS: Record<string, { label: string; tone: ChipTone }> = {
  PENDING: { label: "รออนุมัติ", tone: "orange" },
  APPROVED: { label: "อนุมัติแล้ว", tone: "blue" },
  REJECTED: { label: "ปฏิเสธ", tone: "red" },
  PAID: { label: "จ่ายแล้ว", tone: "green" },
};

const MAPS = {
  order: ORDER_STATUS,
  suborder: SUBORDER_STATUS,
  payment: PAYMENT_STATUS,
  withdrawal: WITHDRAWAL_STATUS,
} as const;

export default function StatusChip({
  status,
  kind,
}: {
  status: string;
  kind: keyof typeof MAPS;
}) {
  const meta = MAPS[kind][status] ?? { label: status, tone: "gray" as ChipTone };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${TONE_CLASS[meta.tone]}`}
    >
      {meta.label}
    </span>
  );
}
