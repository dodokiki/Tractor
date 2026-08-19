"use client";

import { useEffect, useState, type ReactNode } from "react";

/** ทำให้ header ลอยติดบนสุดเสมอ และมีเงาเมื่อผู้ใช้เลื่อนหน้าจอลง */
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
      className={`sticky top-0 z-40 bg-primary transition-shadow duration-200 ${
        scrolled ? "shadow-lg shadow-black/10" : "shadow-none"
      }`}
    >
      {children}
    </header>
  );
}
