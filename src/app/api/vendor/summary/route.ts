import { handler, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { requireVendor } from "../../_lib/vendor";

export const GET = handler(async (req: Request) => {
  const vendor = await requireVendor(req);

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [wallet, todayOrders, monthAgg, pendingConfirm, productCount, lowStock] =
    await Promise.all([
      db.wallet.findUnique({ where: { vendorId: vendor.id } }),
      db.subOrder.count({
        where: { vendorId: vendor.id, order: { createdAt: { gte: startOfToday } } },
      }),
      db.subOrder.aggregate({
        where: {
          vendorId: vendor.id,
          status: { notIn: ["AWAITING_PAYMENT", "CANCELLED"] },
          order: { createdAt: { gte: startOfMonth } },
        },
        _sum: { itemsSatang: true },
      }),
      db.subOrder.count({
        where: { vendorId: vendor.id, status: "PENDING_CONFIRM" },
      }),
      db.product.count({ where: { vendorId: vendor.id, active: true } }),
      db.product.count({
        where: { vendorId: vendor.id, active: true, stock: { lte: 5 } },
      }),
    ]);

  return ok({
    shop: {
      id: vendor.id,
      shopName: vendor.shopName,
      description: vendor.description,
      logoEmoji: vendor.logoEmoji,
      themeColor: vendor.themeColor,
      commissionBps: vendor.commissionBps,
      approved: vendor.approved,
    },
    wallet: {
      balanceSatang: wallet?.balanceSatang ?? 0,
      pendingSatang: wallet?.pendingSatang ?? 0,
    },
    todayOrders,
    monthSalesSatang: monthAgg._sum.itemsSatang ?? 0,
    pendingConfirm,
    productCount,
    lowStock,
  });
});
