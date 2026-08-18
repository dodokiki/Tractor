import { db } from "@/lib/db";
import type { Prisma, OrderStatus } from "@prisma/client";
import Card from "@/components/backoffice/Card";
import StatusFilter from "@/components/backoffice/StatusFilter";
import OrderRow from "@/components/backoffice/admin/OrderRow";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "ทุกสถานะ" },
  { value: "PENDING_PAYMENT", label: "รอชำระเงิน" },
  { value: "PAID", label: "ชำระแล้ว" },
  { value: "COMPLETED", label: "สำเร็จ" },
  { value: "CANCELLED", label: "ยกเลิก" },
  { value: "REFUNDED", label: "คืนเงิน" },
];
const VALID_STATUS = new Set(STATUS_OPTIONS.map((o) => o.value).filter(Boolean));

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const where: Prisma.OrderWhereInput =
    status && VALID_STATUS.has(status) ? { status: status as OrderStatus } : {};

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      payment: true,
      subOrders: { include: { vendor: true, items: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">คำสั่งซื้อ</h1>
          <p className="mt-1 text-sm text-muted">รายการคำสั่งซื้อทั้งหมดในระบบ</p>
        </div>
        <StatusFilter value={status ?? ""} options={STATUS_OPTIONS} />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2 pr-3 font-medium">เลขที่</th>
                <th className="py-2 pr-3 font-medium">ลูกค้า</th>
                <th className="py-2 pr-3 font-medium">ยอดรวม</th>
                <th className="py-2 pr-3 font-medium">การชำระเงิน</th>
                <th className="py-2 pr-3 font-medium">สถานะ</th>
                <th className="py-2 pr-3 font-medium">วันที่</th>
                <th className="py-2 pr-3 font-medium">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    ไม่พบคำสั่งซื้อ
                  </td>
                </tr>
              ) : (
                orders.map((order) => <OrderRow key={order.id} order={order} />)
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
