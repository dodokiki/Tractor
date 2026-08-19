/** เวลาแบบไทยสั้น ๆ "3 ชม.ที่แล้ว" — ใช้กับโพสต์กระทู้/คำตอบ */
export function relativeTimeTh(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชม.ที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} สัปดาห์ที่แล้ว`;
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}
