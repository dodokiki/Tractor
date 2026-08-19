import Link from "next/link";

/**
 * หัวเซกชันสีเขียว + ลิงก์เพจ "1 2 3 ... ถัดไป"
 * pagerHref ให้ค่า undefined ถ้าไม่ต้องการแสดงเพจจิเนชัน
 * หมายเหตุ: ลิงก์นี้พาไปหน้ารายการรวม (combined list) ที่มี ?page= ทำงานจริง —
 * ในเซกชันคัดสรร (เช่น 4 การ์ดยอดนิยม) นี่คือทางลัดไปดูรายการเต็มของหมวดนั้น ๆ
 */
export function SectionHeader({
  title,
  pagerHref,
}: {
  title: string;
  pagerHref?: (page: number) => string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-base font-extrabold text-[#1B7A43] sm:text-lg">{title}</h2>
      {pagerHref && (
        <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted sm:text-sm">
          {[1, 2, 3].map((p) => (
            <Link
              key={p}
              href={pagerHref(p)}
              className="rounded-full px-2 py-1 transition hover:bg-white hover:text-[#1B7A43]"
            >
              {p}
            </Link>
          ))}
          <span aria-hidden>...</span>
          <Link
            href={pagerHref(4)}
            className="rounded-full px-2 py-1 font-bold text-[#4F46E5] transition hover:underline"
          >
            ถัดไป
          </Link>
        </div>
      )}
    </div>
  );
}
