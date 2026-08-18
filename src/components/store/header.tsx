import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CartBadge } from "./cart-badge";

export async function Header() {
  const [user, categories] = await Promise.all([
    getSessionUser(),
    db.category.findMany({
      orderBy: [{ sort: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, emoji: true },
      take: 10,
    }),
  ]);

  return (
    <header className="sticky top-0 z-40 bg-primary shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-3 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 text-lg font-extrabold text-white sm:text-xl"
        >
          <span aria-hidden>🚜</span>
          <span className="hidden xs:inline">TractorHub</span>
        </Link>

        <form action="/products" method="get" className="flex-1">
          <div className="flex items-center rounded-full bg-white/95 shadow-inner">
            <input
              type="text"
              name="q"
              placeholder="ค้นหาอะไหล่ ยี่ห้อ รุ่นรถ..."
              className="w-full rounded-full bg-transparent px-4 py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              aria-label="ค้นหา"
              className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white"
            >
              🔍
            </button>
          </div>
        </form>

        <CartBadge />

        {user ? (
          <Link
            href="/account"
            className="hidden shrink-0 items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white sm:flex"
          >
            👤 {user.name}
          </Link>
        ) : (
          <Link
            href="/login"
            className="shrink-0 rounded-full bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-accent-dark sm:px-4"
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
            className="shrink-0 rounded-full px-3 py-1.5 font-medium text-white/90 hover:bg-white/10"
          >
            สินค้าทั้งหมด
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${encodeURIComponent(c.slug)}`}
              className="shrink-0 rounded-full px-3 py-1.5 text-white/80 hover:bg-white/10"
            >
              {c.emoji} {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
