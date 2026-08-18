const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

/** คืนรายการ {year, month (0-11), label, start, end} ของ n เดือนล่าสุด เรียงเก่า→ใหม่ (รวมเดือนปัจจุบัน) */
export function lastMonths(n: number, from = new Date()) {
  const result: { year: number; month: number; label: string; start: Date; end: Date }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(from.getFullYear(), from.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    result.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: THAI_MONTHS_SHORT[d.getMonth()],
      start,
      end,
    });
  }
  return result;
}

export function startOfMonth(from = new Date()) {
  return new Date(from.getFullYear(), from.getMonth(), 1);
}

export function formatDateThai(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
