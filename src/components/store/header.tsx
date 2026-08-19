import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CartBadge } from "./cart-badge";
import { HeaderShell } from "./header-shell";

export async function Header() {
  const [user, categories] = await Promise.all([
    getSessionUser(),
    db.category.findMany({
      orderBy: [{ sort: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, emoji: true },
      take: 10,
    }),
  ]);

  const isVendor = user?.role === "VENDOR" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  return (
    <HeaderShell>
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-extrabold text-white sm:text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
        >
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 text-xl ring-1 ring-white/25"
          >
            🚜
          </span>
          <span className="hidden sm:inline">TractorHub</span>
        </Link>

        <form action="/products" method="get" className="flex-1">
          <div className="flex items-center rounded-full bg-white shadow-inner ring-1 ring-black/5 transition focus-within:ring-2 focus-within:ring-accent">
            <span className="pl-4 text-muted" aria-hidden>
              🔍
            </span>
            <input
              type="text"
              name="q"
              placeholder="ค้นหาอะไหล่ ยี่ห้อ รุ่นรถ..."
              className="w-full bg-transparent px-2.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none sm:py-3"
            />
            <button
              type="submit"
              aria-label="ค้นหา"
              className="m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark sm:h-9 sm:w-9"
            >
              🔍
            </button>
          </div>
        </form>

        {/* ทางเข้าพอร์ทัลร้านค้า/แอดมิน (desktop) */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full border border-white/40 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              🛠️ หลังบ้านแอดมิน
            </Link>
          )}
          <Link
            href="/vendor"
            className={`rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              isVendor
                ? "bg-primary-light text-white hover:brightness-105"
                : "border border-white/40 text-white hover:bg-white/10"
            }`}
          >
            🏪 {isVendor ? "เข้าร้านของฉัน" : "ร้านอะไหล่"}
          </Link>
        </div>

        <CartBadge />

        {user ? (
          <Link
            href="/account"
            className="hidden shrink-0 items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white sm:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            👤 {user.name}
          </Link>
        ) : (
          <Link
            href="/login"
            className="shrink-0 rounded-full bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark sm:px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            เข้าสู่ระบบ
          </Link>
        )}
        {user && (
          <Link
            href="/account"
            aria-label="บัญชีของฉัน"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg text-white sm:hidden"
          >
            👤
          </Link>
        )}
      </div>

      <nav className="border-t border-white/10 bg-primary-dark">
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-3 py-2 text-sm sm:gap-2 sm:px-6">
          <Link
            href="/products"
            className="shrink-0 rounded-full px-3 py-1.5 font-medium text-white/90 transition hover:bg-white/10"
          >
            สินค้าทั้งหมด
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${encodeURIComponent(c.slug)}`}
              className="shrink-0 rounded-full px-3 py-1.5 text-white/80 transition hover:bg-white/10"
            >
              {c.emoji} {c.name}
            </Link>
          ))}
          {/* ทางเข้าพอร์ทัลร้านค้า/แอดมิน (มือถือ) */}
          <span className="mx-1 h-4 w-px shrink-0 bg-white/15 lg:hidden" aria-hidden />
          <Link
            href="/vendor"
            className={`shrink-0 rounded-full px-3 py-1.5 font-medium transition lg:hidden ${
              isVendor ? "bg-primary-light text-white" : "text-white/80 hover:bg-white/10"
            }`}
          >
            🏪 {isVendor ? "เข้าร้านของฉัน" : "ร้านอะไหล่"}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="shrink-0 rounded-full px-3 py-1.5 font-medium text-white/80 transition hover:bg-white/10 lg:hidden"
            >
              🛠️ หลังบ้านแอดมิน
            </Link>
          )}
        </div>
      </nav>
    </HeaderShell>
  );
}
