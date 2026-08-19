/** วงกลมอักษรแรกของชื่อผู้ใช้ ใช้แทนรูปโปรไฟล์ในกระทู้/คำตอบ */
export function AvatarCircle({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  const cls = size === "md" ? "h-10 w-10 text-base" : "h-8 w-8 text-sm";
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8CC63F] to-[#1B7A43] font-bold text-white ${cls}`}
    >
      {letter}
    </span>
  );
}
