"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = {
  href: string;
  label: string;
  emoji: string;
  /** ให้ active เมื่อ path ขึ้นต้นด้วยรายการใดใน matchPrefixes (default: [href]) */
  matchPrefixes?: string[];
};

const ADMIN_MENU: MenuItem[] = [
  { href: "/admin", label: "แดชบอร์ด", emoji: "📊" },
  { href: "/admin/orders", label: "คำสั่งซื้อ", emoji: "🧾" },
  { href: "/admin/vendors", label: "ร้านค้าพาร์ทเนอร์", emoji: "🏪" },
  { href: "/admin/withdrawals", label: "คำขอถอนเงิน", emoji: "💸" },
  {
    href: "/admin/coupons",
    label: "คูปอง/แบนเนอร์",
    emoji: "🎟️",
    matchPrefixes: ["/admin/coupons", "/admin/banners"],
  },
  { href: "/admin/vehicles", label: "ประวัติรถ", emoji: "🚜" },
  { href: "/admin/users", label: "ผู้ใช้", emoji: "👤" },
];

const VENDOR_MENU: MenuItem[] = [
  { href: "/vendor", label: "ภาพรวมร้าน", emoji: "📊" },
  { href: "/vendor/products", label: "สินค้า", emoji: "📦" },
  { href: "/vendor/orders", label: "คำสั่งซื้อ", emoji: "🧾" },
  { href: "/vendor/wallet", label: "กระเป๋าเงิน", emoji: "💰" },
];

function isActive(pathname: string, item: MenuItem) {
  const prefixes = item.matchPrefixes ?? [item.href];
  return prefixes.some((p) =>
    p === "/admin" || p === "/vendor" ? pathname === p : pathname.startsWith(p),
  );
}

export default function Sidebar({
  role,
  title,
  subtitle,
}: {
  role: "ADMIN" | "VENDOR";
  title: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const menu = role === "ADMIN" ? ADMIN_MENU : VENDOR_MENU;
  const bg = role === "ADMIN" ? "bg-primary-dark" : "bg-primary";

  return (
    <aside className={`${bg} sticky top-0 flex h-screen w-64 shrink-0 flex-col self-start text-white`}>
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-2 text-lg font-bold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/rodlex-logo.png" alt="Rodlex" className="h-7 w-7 object-contain" />
          <span>Rodlex</span>
        </div>
        <div className="mt-1 text-xs text-white/60">{title}</div>
        {subtitle ? (
          <div className="mt-0.5 truncate text-xs text-white/50">{subtitle}</div>
        ) : null}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menu.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-white/15 font-semibold text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-base">{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <LogoutLink />
      </div>
    </aside>
  );
}

function LogoutLink() {
  return (
    <Link
      href="/login"
      className="text-xs text-white/60 hover:text-white/90"
      onClick={async (e) => {
        e.preventDefault();
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } finally {
          window.location.href = "/login";
        }
      }}
    >
      ออกจากระบบ
    </Link>
  );
}
