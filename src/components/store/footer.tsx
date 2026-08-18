import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary-dark text-white/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="flex items-center gap-1.5 text-lg font-extrabold text-white">
            <span aria-hidden>🚜</span> TractorHub
          </p>
          <p className="mt-2 text-sm">
            ศูนย์กลางบริการซ่อมบำรุงรถแทรกเตอร์ครบวงจร มาร์เก็ตเพลสอะไหล่หลายร้านค้า
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold text-white">ช้อปปิ้ง</p>
          <ul className="space-y-1.5">
            <li>
              <Link href="/products" className="hover:text-white">
                สินค้าทั้งหมด
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white">
                ตะกร้าของฉัน
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-white">
                คำสั่งซื้อของฉัน
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold text-white">บัญชี</p>
          <ul className="space-y-1.5">
            <li>
              <Link href="/login" className="hover:text-white">
                เข้าสู่ระบบ
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-white">
                ข้อมูลของฉัน
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold text-white">ติดต่อเรา</p>
          <p>โทร: 02-000-0000</p>
          <p>อีเมล: support@tractorhub.co.th</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} TractorHub — สงวนลิขสิทธิ์
      </div>
    </footer>
  );
}
