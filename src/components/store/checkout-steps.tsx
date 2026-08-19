const STEPS = [
  { label: "ที่อยู่จัดส่ง", icon: "📍" },
  { label: "ชำระเงิน", icon: "💳" },
  { label: "เสร็จสิ้น", icon: "🎉" },
];

/** แถบ stepper 3 ขั้นตอนของกระบวนการสั่งซื้อ */
export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mb-6 flex items-center">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <li key={step.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition sm:h-10 sm:w-10 ${
                  done
                    ? "bg-primary text-white"
                    : active
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-line text-muted"
                }`}
                aria-hidden
              >
                {done ? "✓" : step.icon}
              </span>
              <span
                className={`text-[11px] font-semibold sm:text-xs ${
                  active || done ? "text-ink" : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {stepNum < STEPS.length && (
              <span
                className={`mx-2 mb-5 h-0.5 flex-1 rounded-full transition sm:mx-3 ${
                  done ? "bg-primary" : "bg-line"
                }`}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
