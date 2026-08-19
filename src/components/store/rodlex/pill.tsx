import Link from "next/link";
import type { ReactNode } from "react";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const VARIANT = {
  solid:
    "bg-gradient-to-r from-[#8CC63F] to-[#1B7A43] text-white shadow-sm hover:brightness-105 focus-visible:ring-[#1B7A43]",
  outline:
    "bg-white text-[#1B7A43] ring-1 ring-[#1B7A43]/30 hover:bg-[#1B7A43]/5 focus-visible:ring-[#1B7A43]",
  ghost: "bg-white/70 text-ink ring-1 ring-black/5 hover:bg-white focus-visible:ring-[#1B7A43]",
} as const;

type Variant = keyof typeof VARIANT;

/** ปุ่ม pill เขียว (ใช้เป็นลิงก์) — แนวเดียวกับ CTA ในทุก mockup ของ Rodlex */
export function PillLink({
  href,
  children,
  variant = "solid",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={`${BASE} ${VARIANT[variant]} ${className}`}>
      {children}
    </Link>
  );
}

/** ปุ่ม pill เขียว (ใช้เป็น button สำหรับ action ในฝั่ง client) */
export function PillButton({
  children,
  variant = "solid",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`${BASE} ${VARIANT[variant]} ${className}`}>
      {children}
    </button>
  );
}
