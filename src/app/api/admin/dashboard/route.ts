import { handler, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const TH_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

export const GET = handler(async () => {
  await requireUser("ADMIN");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOf6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const paidStatuses = ["PAID", "COMPLETED"] as const;

  const [monthAgg, orderCount, completedSubOrders, commissionAgg] =
    await Promise.all([
      db.order.aggregate({
        where: { status: { in: [...paidStatuses] }, createdAt: { gte: startOfMonth } },
        _sum: { totalSatang: true },
      }),
      db.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.subOrder.count({ where: { status: "COMPLETED" } }),
      db.subOrder.aggregate({
        where: { status: "COMPLETED" },
        _sum: { commissionSatang: true },
      }),
    ]);

  // --- ยอดขาย 6 เดือนย้อนหลัง (สำหรับกราฟแท่ง) ---
  const recentOrders = await db.order.findMany({
    where: {
      status: { in: [...paidStatuses] },
      createdAt: { gte: startOf6Months },
    },
    select: { totalSatang: true, createdAt: true },
  });
  const buckets: { key: string; label: string; satang: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: TH_MONTHS[d.getMonth()],
      satang: 0,
    });
  }
  const bucketMap = new Map(buckets.map((b) => [b.key, b]));
  for (const o of recentOrders) {
    const k = `${o.createdAt.getFullYear()}-${o.createdAt.getMonth()}`;
    const b = bucketMap.get(k);
    if (b) b.satang += o.totalSatang;
  }

  // --- รายการรอยืนยันยอดโอน ---
  const pending = await db.payment.findMany({
    where: {
      status: "PENDING",
      method: { in: ["BANK_TRANSFER", "PROMPTPAY"] },
      order: { status: "PENDING_PAYMENT" },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      order: { include: { user: { select: { name: true, phone: true } } } },
    },
  });

  const latest = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      user: { select: { name: true, phone: true } },
      payment: { select: { status: true, method: true } },
      subOrders: { select: { vendor: { select: { shopName: true } } } },
    },
  });

  return ok({
    monthSalesSatang: monthAgg._sum.totalSatang ?? 0,
    orderCount,
    completedSubOrders,
    commissionSatang: commissionAgg._sum.commissionSatang ?? 0,
    salesByMonth: buckets.map((b) => ({ label: b.label, satang: b.satang })),
    pendingTransfers: pending.map((p) => ({
      paymentId: p.id,
      orderId: p.orderId,
      orderCode: p.order.code,
      customerName: p.order.user.name,
      customerPhone: p.order.user.phone,
      method: p.method,
      amountSatang: p.amountSatang,
      slipNote: p.slipNote,
      createdAt: p.createdAt,
    })),
    latestOrders: latest.map((o) => ({
      id: o.id,
      code: o.code,
      status: o.status,
      totalSatang: o.totalSatang,
      createdAt: o.createdAt,
      customerName: o.user.name,
      paymentStatus: o.payment?.status ?? null,
      paymentMethod: o.payment?.method ?? null,
      shops: o.subOrders.map((s) => s.vendor.shopName),
    })),
  });
});
