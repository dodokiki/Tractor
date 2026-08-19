import type { OrderStatus } from "@prisma/client";

const STEPS = [
  { label: "รอชำระ", icon: "🧾" },
  { label: "ชำระแล้ว", icon: "💳" },
  { label: "กำลังดำเนินการ", icon: "📦" },
  { label: "สำเร็จ", icon: "🎉" },
];

/** แปลงสถานะออเดอร์ → ขั้นที่ทำเสร็จแล้วกี่ขั้น (0-4) */
function stepsDoneFor(status: OrderStatus): number {
  switch (status) {
    case "PENDING_PAYMENT":
      return 1;
    case "PAID":
      return 3;
    case "COMPLETED":
      return 4;
    default:
      return 0;
  }
}

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED" || status === "REFUNDED") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-line/40 px-4 py-3 text-sm font-semibold text-muted">
        <span aria-hidden>✕</span>
        {status === "CANCELLED" ? "คำสั่งซื้อนี้ถูกยกเลิก" : "คำสั่งซื้อนี้ถูกคืนเงินแล้ว"}
      </div>
    );
  }

  const done = stepsDoneFor(status);

  return (
    <ol className="flex items-start">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum <= done;
        const isActive = stepNum === done;
        return (
          <li key={step.label} className="flex flex-1 flex-col items-center last:flex-none">
            <div className="flex w-full items-center">
              <span
                className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition sm:h-9 sm:w-9 sm:text-sm ${
                  isDone
                    ? isActive
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-primary text-white"
                    : "bg-line text-muted"
                }`}
                aria-hidden
              >
                {isDone && !isActive ? "✓" : step.icon}
              </span>
              {idx < STEPS.length - 1 && (
                <span
                  className={`-ml-0.5 h-0.5 flex-1 rounded-full transition ${
                    stepNum < done ? "bg-primary" : "bg-line"
                  }`}
                  aria-hidden
                />
              )}
            </div>
            <span
              className={`mt-1.5 text-center text-[10px] font-semibold leading-tight sm:text-xs ${
                isDone ? "text-ink" : "text-muted"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
