import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Card from "@/components/backoffice/Card";
import Forbidden from "@/components/backoffice/Forbidden";
import StatusFilter from "@/components/backoffice/StatusFilter";
import VendorOrderRow from "@/components/backoffice/vendor/VendorOrderRow";
import type { Prisma, SubOrderStatus } from "@prisma/client";

const STATUS_OPTIONS = [
  { value: "", label: "ทุกสถานะ" },
  { value: "PENDING_CONFIRM", label: "รอยืนยัน" },
  { value: "CONFIRMED", label: "ยืนยันแล้ว" },
  { value: "SHIPPED", label: "จัดส่งแล้ว" },
  { value: "COMPLETED", label: "สำเร็จ" },
  { value: "CANCELLED", label: "ยกเลิก" },
];
const VALID_STATUS = new Set(STATUS_OPTIONS.map((o) => o.value).filter(Boolean));

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getSessionUser();
  const vendor = user?.vendor;
  if (!vendor) return <Forbidden message="บัญชีนี้ยังไม่ได้ผูกกับร้านค้า" />;

  const { status } = await searchParams;
  const where: Prisma.SubOrderWhereInput = {
    vendorId: vendor.id,
    ...(status && VALID_STATUS.has(status) ? { status: status as SubOrderStatus } : {}),
  };

  const subOrders = await db.subOrder.findMany({
    where,
    orderBy: { order: { createdAt: "desc" } },
    include: { items: true, order: true },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">คำสั่งซื้อ</h1>
          <p className="mt-1 text-sm text-muted">คำสั่งซื้อของร้าน {vendor.shopName}</p>
        </div>
        <StatusFilter value={status ?? ""} options={STATUS_OPTIONS} />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2 pr-3 font-medium">เลขที่</th>
                <th className="py-2 pr-3 font-medium">ผู้รับ</th>
                <th className="py-2 pr-3 font-medium">ยอดขาย</th>
                <th className="py-2 pr-3 font-medium">สถานะ</th>
                <th className="py-2 pr-3 font-medium">วันที่</th>
                <th className="py-2 pr-3 font-medium">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {subOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    ไม่พบคำสั่งซื้อ
                  </td>
                </tr>
              ) : (
                subOrders.map((so) => <VendorOrderRow key={so.id} subOrder={so} />)
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
