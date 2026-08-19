"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/technicians", label: "ทีมช่าง" },
  { href: "/shops", label: "ร้านอะไหล่" },
  { href: "/jobs", label: "สมัครงาน" },
  { href: "/forum", label: "กระทู้ถาม-ตอบ" },
  { href: "/news", label: "ข่าว" },
];

export function HeaderMobileMenu({
  loggedIn,
  isVendor,
  isAdmin,
}: {
  loggedIn: boolean;
  isVendor: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setOpen(false);
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="เปิดเมนู"
        aria-expanded={open}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-ink transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-t border-line bg-white px-3 py-4 shadow-lg sm:px-6">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 flex gap-2 border-t border-line pt-3">
            <Link
              href="/call"
              onClick={() => setOpen(false)}
              className="link-indigo flex-1 rounded-xl bg-surface px-3 py-2.5 text-center text-sm font-bold"
            >
              เรียกช่าง
            </Link>
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="link-indigo flex-1 rounded-xl bg-surface px-3 py-2.5 text-center text-sm font-bold"
            >
              ซื้ออะไหล่
            </Link>
          </div>

          <div className="mt-3 flex flex-col gap-1 border-t border-line pt-3">
            {loggedIn ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface"
                >
                  👤 บัญชีของฉัน
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface"
                >
                  📦 คำสั่งซื้อของฉัน
                </Link>
                <Link
                  href="/vendor"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface"
                >
                  🏪 {isVendor ? "ร้านของฉัน" : "เปิดร้านค้า"}
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface"
                  >
                    🛠️ หลังบ้านแอดมิน
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  {loading ? "กำลังออกจากระบบ..." : "🚪 ออกจากระบบ"}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-full bg-primary px-4 py-2.5 text-center text-sm font-bold text-white"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
