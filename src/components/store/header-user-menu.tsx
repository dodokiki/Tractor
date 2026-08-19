"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function HeaderUserMenu({
  name,
  isVendor,
  isAdmin,
}: {
  name: string;
  isVendor: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        👤 {name}
        <span aria-hidden className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-black/10">
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface"
          >
            👤 บัญชีของฉัน
          </Link>
          <Link
            href="/orders"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface"
          >
            📦 คำสั่งซื้อของฉัน
          </Link>
          <Link
            href="/vendor"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface"
          >
            🏪 {isVendor ? "ร้านของฉัน" : "เปิดร้านค้า"}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface"
            >
              🛠️ หลังบ้านแอดมิน
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="mt-1 block w-full rounded-xl border-t border-line px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            {loading ? "กำลังออกจากระบบ..." : "🚪 ออกจากระบบ"}
          </button>
        </div>
      )}
    </div>
  );
}
