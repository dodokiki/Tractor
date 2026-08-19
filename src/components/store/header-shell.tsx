"use client";

import { useEffect, useState, type ReactNode } from "react";

/** ทำให้ header ลอยติดบนสุดเสมอ พื้นขาวโปร่งแสงแบบ Rodlex และมีเงาเมื่อผู้ใช้เลื่อนหน้าจอลง */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur transition-shadow duration-200 ${
        scrolled ? "shadow-lg shadow-black/5" : "shadow-none"
      }`}
    >
      {children}
    </header>
  );
}
