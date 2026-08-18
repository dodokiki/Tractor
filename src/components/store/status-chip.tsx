import type { OrderStatus, SubOrderStatus } from "@prisma/client";

const ORDER_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "รอชำระเงิน",
  PAID: "ชำระแล้ว",
  COMPLETED: "สำเร็จ",
  CANCELLED: "ยกเลิก",
  REFUNDED: "คืนเงิน",
};

const SUBORDER_LABEL: Record<SubOrderStatus, string> = {
  AWAITING_PAYMENT: "รอชำระเงิน",
  PENDING_CONFIRM: "รอร้านยืนยัน",
  CONFIRMED: "ร้านยืนยันแล้ว",
  SHIPPED: "จัดส่งแล้ว",
  COMPLETED: "สำเร็จ",
  CANCELLED: "ยกเลิก",
};

// สีตาม CONTRACT: รอชำระ=ส้ม, ชำระแล้ว=น้ำเงิน, สำเร็จ=เขียว, ยกเลิก=เทา
function colorClass(status: string): string {
  switch (status) {
    case "PENDING_PAYMENT":
    case "AWAITING_PAYMENT":
      return "bg-orange-100 text-accent-dark";
    case "PAID":
    case "PENDING_CONFIRM":
    case "CONFIRMED":
    case "SHIPPED":
      return "bg-blue-100 text-blue-700";
    case "COMPLETED":
      return "bg-primary/10 text-primary";
    case "CANCELLED":
    case "REFUNDED":
    default:
      return "bg-line text-muted";
  }
}

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${colorClass(status)}`}
    >
      {ORDER_LABEL[status]}
    </span>
  );
}

export function SubOrderStatusChip({ status }: { status: SubOrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${colorClass(status)}`}
    >
      {SUBORDER_LABEL[status]}
    </span>
  );
}
