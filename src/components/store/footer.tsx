import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary-dark text-white/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 text-lg font-extrabold text-white">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-lg ring-1 ring-white/20"
            >
              🚜
            </span>
            TractorHub
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            ศูนย์กลางบริการซ่อมบำรุงรถแทรกเตอร์ครบวงจร มาร์เก็ตเพลสอะไหล่หลายร้านค้า
            เทียบราคาง่าย ตรงรุ่นรถแน่นอน
          </p>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold text-white">เมนูลัด</p>
          <ul className="space-y-2">
            <li>
              <Link href="/products" className="transition hover:text-white">
                สินค้าทั้งหมด
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition hover:text-white">
                ตะกร้าของฉัน
              </Link>
            </li>
            <li>
              <Link href="/orders" className="transition hover:text-white">
                คำสั่งซื้อของฉัน
              </Link>
            </li>
            <li>
              <Link href="/account" className="transition hover:text-white">
                บัญชีของฉัน
              </Link>
            </li>
            <li className="pt-1">
              <Link href="/vendor" className="flex items-center gap-1.5 transition hover:text-white">
                🏪 สำหรับร้านค้าพาร์ทเนอร์
              </Link>
            </li>
            <li>
              <Link href="/admin" className="flex items-center gap-1.5 transition hover:text-white">
                🛠️ สำหรับผู้ดูแลระบบ
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold text-white">ติดต่อเรา</p>
          <p className="flex items-center gap-1.5">📞 02-000-0000</p>
          <p className="mt-1.5 flex items-center gap-1.5">✉️ support@tractorhub.co.th</p>
          <p className="mb-2 mt-5 font-semibold text-white">ติดตามเรา</p>
          <div className="flex gap-2">
            {["FB", "IG", "LN"].map((s) => (
              <span
                key={s}
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold ring-1 ring-white/15"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} TractorHub — สงวนลิขสิทธิ์
      </div>
    </footer>
  );
}
