import { db } from "@/lib/db";
import { formatBaht } from "@/lib/money";
import Card from "@/components/backoffice/Card";
import Toggle from "@/components/backoffice/Toggle";
import PromoTabs from "@/components/backoffice/admin/PromoTabs";
import AddCouponForm from "@/components/backoffice/admin/AddCouponForm";
import { formatDateThai } from "@/components/backoffice/dateUtils";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">คูปอง/แบนเนอร์</h1>
        <p className="mt-1 text-sm text-muted">จัดการโค้ดส่วนลดสำหรับลูกค้า</p>
      </div>

      <PromoTabs active="coupons" />

      <Card title="เพิ่มคูปองใหม่">
        <AddCouponForm />
      </Card>

      <Card title={`คูปองทั้งหมด (${coupons.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2 pr-3 font-medium">รหัส</th>
                <th className="py-2 pr-3 font-medium">ประเภท</th>
                <th className="py-2 pr-3 font-medium">มูลค่า</th>
                <th className="py-2 pr-3 font-medium">ยอดขั้นต่ำ</th>
                <th className="py-2 pr-3 font-medium">ใช้ไปแล้ว</th>
                <th className="py-2 pr-3 font-medium">หมดอายุ</th>
                <th className="py-2 pr-3 font-medium">เปิดใช้งาน</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    ยังไม่มีคูปอง
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-3 font-mono font-semibold">{c.code}</td>
                    <td className="py-2.5 pr-3">
                      {c.type === "PERCENT" ? "เปอร์เซ็นต์" : "จำนวนเงิน"}
                    </td>
                    <td className="py-2.5 pr-3">
                      {c.type === "PERCENT" ? `${c.value}%` : formatBaht(c.value)}
                    </td>
                    <td className="py-2.5 pr-3">{formatBaht(c.minTotalSatang)}</td>
                    <td className="py-2.5 pr-3">{c.usedCount.toLocaleString("th-TH")}</td>
                    <td className="py-2.5 pr-3 text-muted">
                      {c.expiresAt ? formatDateThai(c.expiresAt) : "ไม่มีกำหนด"}
                    </td>
                    <td className="py-2.5 pr-3">
                      <Toggle url={`/api/admin/coupons/${c.id}`} field="active" value={c.active} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
