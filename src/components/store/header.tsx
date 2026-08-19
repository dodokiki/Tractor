import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { CartBadge } from "./cart-badge";
import { HeaderShell } from "./header-shell";
import { HeaderUserMenu } from "./header-user-menu";
import { HeaderMobileMenu } from "./header-mobile-menu";

const NAV_LINKS = [
  { href: "/technicians", label: "ทีมช่าง" },
  { href: "/shops", label: "ร้านอะไหล่" },
  { href: "/jobs", label: "สมัครงาน" },
  { href: "/forum", label: "กระทู้ถาม-ตอบ" },
  { href: "/news", label: "ข่าว" },
];

export async function Header() {
  const user = await getSessionUser();
  const isVendor = user?.role === "VENDOR" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  return (
    <HeaderShell>
      <div className="relative mx-auto flex max-w-6xl flex-col gap-2 px-3 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {/* โลโก้ + Thailand + คำโปรย */}
          <Link
            href="/"
            className="flex shrink-0 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            <span className="flex items-end gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/rodlex-logo.png" alt="Rodlex รถเหล็ก" className="h-10 w-auto sm:h-14" />
              <span className="hidden pb-0.5 text-sm font-semibold text-link sm:inline">Thailand</span>
            </span>
            <span className="hidden text-[11px] text-muted sm:block">
              รวมช่างซ่อมเครื่องจักรก่อสราง เครื่องจักรเกษตร
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 text-sm lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="shrink-0 rounded-full px-3 py-2 font-semibold text-ink/80 transition hover:bg-surface hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
            {user ? (
              <HeaderUserMenu name={user.name} isVendor={isVendor} isAdmin={isAdmin} />
            ) : (
              <Link
                href="/login"
                className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                เข้าสู่ระบบ
              </Link>
            )}
            <HeaderMobileMenu loggedIn={Boolean(user)} isVendor={isVendor} isAdmin={isAdmin} />
          </div>
        </div>

        {/* คำโปรยมือถือ */}
        <p className="text-[11px] text-muted sm:hidden">
          รวมช่างซ่อมเครื่องจักรก่อสราง เครื่องจักรเกษตร
        </p>

        {/* แถวรอง: เรียกช่าง / ซื้ออะไหล่ / ตะกร้า / En-Th */}
        <div className="flex items-center justify-end gap-4 border-t border-line/70 pt-2 text-sm font-bold">
          <Link href="/call" className="link-indigo transition">
            เรียกช่าง
          </Link>
          <Link href="/products" className="link-indigo transition">
            ซื้ออะไหล่
          </Link>
          <CartBadge />
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted ring-1 ring-line">
            En/Th
          </span>
        </div>
      </div>
    </HeaderShell>
  );
}
