import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBaht } from "@/lib/money";
import StatCard from "@/components/backoffice/StatCard";
import Forbidden from "@/components/backoffice/Forbidden";
import { startOfMonth } from "@/components/backoffice/dateUtils";

export default async function VendorDashboardPage() {
  const user = await getSessionUser();
  const vendor = user?.vendor;
  if (!vendor) return <Forbidden message="บัญชีนี้ยังไม่ได้ผูกกับร้านค้า" />;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = startOfMonth();

  const [wallet, todayOrders, monthSubOrders] = await Promise.all([
    db.wallet.findUnique({ where: { vendorId: vendor.id } }),
    db.subOrder.count({
      where: { vendorId: vendor.id, order: { createdAt: { gte: todayStart } } },
    }),
    db.subOrder.findMany({
      where: {
        vendorId: vendor.id,
        status: { notIn: ["AWAITING_PAYMENT", "CANCELLED"] },
        order: { createdAt: { gte: monthStart } },
      },
      select: { itemsSatang: true },
    }),
  ]);

  const monthSalesSatang = monthSubOrders.reduce((sum, s) => sum + s.itemsSatang, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">
          {vendor.logoEmoji} {vendor.shopName}
        </h1>
        <p className="mt-1 text-sm text-muted">
          ภาพรวมร้านค้า {vendor.approved ? "" : "· รอการอนุมัติจากแอดมิน"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="ยอดคงเหลือ" value={formatBaht(wallet?.balanceSatang ?? 0)} accent />
        <StatCard label="ยอดรอเคลียร์" value={formatBaht(wallet?.pendingSatang ?? 0)} />
        <StatCard label="ออเดอร์วันนี้" value={todayOrders.toLocaleString("th-TH")} />
        <StatCard label="ยอดขายเดือนนี้" value={formatBaht(monthSalesSatang)} />
      </div>
    </div>
  );
}
