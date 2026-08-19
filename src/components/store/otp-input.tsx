"use client";

import { useRef } from "react";

const LENGTH = 6;

/** ช่องกรอกรหัส OTP 6 หลักแยกกล่อง พิมพ์แล้วเด้งไปช่องถัดไป รองรับการวางรหัสทั้งชุด */
export function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  function setDigitAt(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join("").slice(0, LENGTH));
  }

  function handleChange(index: number, raw: string) {
    const clean = raw.replace(/\D/g, "");
    if (!clean) {
      setDigitAt(index, "");
      return;
    }
    if (clean.length > 1) {
      // ผู้ใช้พิมพ์เร็วหรือ IME ส่งมาหลายตัว — กระจายลงช่องถัดไป
      const chars = clean.split("");
      const next = digits.slice();
      let i = index;
      for (const c of chars) {
        if (i >= LENGTH) break;
        next[i] = c;
        i++;
      }
      onChange(next.join("").slice(0, LENGTH));
      refs.current[Math.min(i, LENGTH - 1)]?.focus();
      return;
    }
    setDigitAt(index, clean);
    if (index < LENGTH - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={LENGTH}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="h-12 w-10 rounded-xl border-2 border-line text-center text-lg font-bold text-ink transition focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-14 sm:w-12 sm:text-xl"
          aria-label={`หลักที่ ${i + 1} ของรหัส OTP`}
        />
      ))}
    </div>
  );
}
