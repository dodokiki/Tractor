import { db } from "@/lib/db";
import { formatBaht } from "@/lib/money";
import StatCard from "@/components/backoffice/StatCard";
import Card from "@/components/backoffice/Card";
import SalesBarChart from "@/components/backoffice/SalesBarChart";
import StatusChip from "@/components/backoffice/StatusChip";
import { lastMonths, startOfMonth, formatDateThai } from "@/components/backoffice/dateUtils";

export default async function AdminDashboardPage() {
  const monthStart = startOfMonth();
  const months = lastMonths(6);
  const rangeStart = months[0].start;

  const [ordersInRange, ordersThisMonth, pendingTransfers, latestOrders] = await Promise.all([
    db.order.findMany({
      where: { status: { in: ["PAID", "COMPLETED"] }, createdAt: { gte: rangeStart } },
      select: { totalSatang: true, createdAt: true },
    }),
    db.order.findMany({
      where: { createdAt: { gte: monthStart } },
      select: { id: true, status: true, createdAt: true },
    }),
    db.subOrder.findMany({
      where: { status: "PENDING_CONFIRM" },
      include: { vendor: true, order: true },
      orderBy: { order: { createdAt: "asc" } },
      take: 10,
    }),
    db.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: true, payment: true, subOrders: true },
    }),
  ]);

  const salesByMonth = months.map((m) => ({
    label: m.label,
    satang: ordersInRange
      .filter((o) => o.createdAt >= m.start && o.createdAt < m.end)
      .reduce((sum, o) => sum + o.totalSatang, 0),
  }));

  const monthSalesSatang = salesByMonth[salesByMonth.length - 1]?.satang ?? 0;
  const orderCount = ordersThisMonth.length;

  const completedSubOrdersThisMonth = await db.subOrder.count({
    where: { status: "COMPLETED", settledAt: { gte: monthStart } },
  });

  const commissionAgg = await db.subOrder.findMany({
    where: {
      status: { notIn: ["AWAITING_PAYMENT", "CANCELLED"] },
      order: { createdAt: { gte: monthStart } },
    },
    select: { commissionSatang: true },
  });
  const commissionSatang = commissionAgg.reduce((sum, s) => sum + s.commissionSatang, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">แดชบอร์ด</h1>
        <p className="mt-1 text-sm text-muted">ภาพรวมยอดขายและงานของแพลตฟอร์ม</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="ยอดขายเดือนนี้" value={formatBaht(monthSalesSatang)} />
        <StatCard label="คำสั่งซื้อ" value={orderCount.toLocaleString("th-TH")} sub="รายการเดือนนี้" />
        <StatCard
          label="งานสำเร็จ"
          value={completedSubOrdersThisMonth.toLocaleString("th-TH")}
          sub="ออเดอร์ร้านค้าเดือนนี้"
        />
        <StatCard
          label="ค่าคอมมิชชันแพลตฟอร์ม"
          value={formatBaht(commissionSatang)}
          accent
          sub="เดือนนี้"
        />
      </div>

      <Card title="ยอดขายย้อนหลัง 6 เดือน">
        <SalesBarChart data={salesByMonth} />
      </Card>

      <Card title="รอโอนเงินให้ร้านค้า">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2 pr-3 font-medium">ร้าน</th>
                <th className="py-2 pr-3 font-medium">ยอดขาย</th>
                <th className="py-2 pr-3 font-medium">คอมมิชชัน</th>
                <th className="py-2 pr-3 font-medium">ยอดสุทธิ</th>
                <th className="py-2 pr-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {pendingTransfers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted">
                    ไม่มีรายการรอโอนเงิน
                  </td>
                </tr>
              ) : (
                pendingTransfers.map((so) => (
                  <tr key={so.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-3">
                      {so.vendor.logoEmoji} {so.vendor.shopName}
                    </td>
                    <td className="py-2.5 pr-3">{formatBaht(so.itemsSatang)}</td>
                    <td className="py-2.5 pr-3">{formatBaht(so.commissionSatang)}</td>
                    <td className="py-2.5 pr-3 font-semibold">{formatBaht(so.netSatang)}</td>
                    <td className="py-2.5 pr-3">
                      <StatusChip status={so.status} kind="suborder" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="คำสั่งซื้อล่าสุด">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2 pr-3 font-medium">เลขที่</th>
                <th className="py-2 pr-3 font-medium">ลูกค้า</th>
                <th className="py-2 pr-3 font-medium">ยอดรวม</th>
                <th className="py-2 pr-3 font-medium">การชำระเงิน</th>
                <th className="py-2 pr-3 font-medium">สถานะ</th>
                <th className="py-2 pr-3 font-medium">วันที่</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted">
                    ยังไม่มีคำสั่งซื้อ
                  </td>
                </tr>
              ) : (
                latestOrders.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{o.code}</td>
                    <td className="py-2.5 pr-3">{o.user.name}</td>
                    <td className="py-2.5 pr-3">{formatBaht(o.totalSatang)}</td>
                    <td className="py-2.5 pr-3">
                      {o.payment ? <StatusChip status={o.payment.status} kind="payment" /> : "-"}
                    </td>
                    <td className="py-2.5 pr-3">
                      <StatusChip status={o.status} kind="order" />
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-muted">
                      {formatDateThai(o.createdAt)}
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
