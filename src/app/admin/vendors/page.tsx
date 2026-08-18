import { db } from "@/lib/db";
import { formatBaht } from "@/lib/money";
import Card from "@/components/backoffice/Card";
import Toggle from "@/components/backoffice/Toggle";
import CommissionEditor from "@/components/backoffice/admin/CommissionEditor";
import AddVendorForm from "@/components/backoffice/admin/AddVendorForm";

export default async function AdminVendorsPage() {
  const vendors = await db.vendor.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, wallet: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">ร้านค้าพาร์ทเนอร์</h1>
        <p className="mt-1 text-sm text-muted">จัดการร้านค้า อนุมัติ และตั้งค่าคอมมิชชัน</p>
      </div>

      <Card title="เพิ่มร้านค้าใหม่">
        <AddVendorForm />
      </Card>

      <Card title={`ร้านค้าทั้งหมด (${vendors.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2 pr-3 font-medium">ร้านค้า</th>
                <th className="py-2 pr-3 font-medium">เจ้าของ</th>
                <th className="py-2 pr-3 font-medium">คอมมิชชัน</th>
                <th className="py-2 pr-3 font-medium">ยอดคงเหลือ</th>
                <th className="py-2 pr-3 font-medium">อนุมัติแล้ว</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    ยังไม่มีร้านค้าในระบบ
                  </td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-3 font-medium">
                      {v.logoEmoji} {v.shopName}
                    </td>
                    <td className="py-2.5 pr-3">
                      {v.user.name}
                      <div className="text-xs text-muted">{v.user.phone}</div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <CommissionEditor vendorId={v.id} commissionBps={v.commissionBps} />
                    </td>
                    <td className="py-2.5 pr-3">
                      {formatBaht(v.wallet?.balanceSatang ?? 0)}
                    </td>
                    <td className="py-2.5 pr-3">
                      <Toggle url={`/api/admin/vendors/${v.id}`} field="approved" value={v.approved} />
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
