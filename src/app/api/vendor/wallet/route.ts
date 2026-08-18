import { handler, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { requireVendor } from "../../_lib/vendor";

export const GET = handler(async (req: Request) => {
  const vendor = await requireVendor(req);

  const wallet = await db.wallet.findUnique({
    where: { vendorId: vendor.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { subOrder: { include: { order: { select: { code: true } } } } },
      },
    },
  });

  const withdrawals = await db.withdrawalRequest.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return ok({
    wallet: {
      balanceSatang: wallet?.balanceSatang ?? 0,
      pendingSatang: wallet?.pendingSatang ?? 0,
    },
    transactions: (wallet?.transactions ?? []).map((t) => ({
      id: t.id,
      type: t.type,
      amountSatang: t.amountSatang,
      note: t.note,
      orderCode: t.subOrder?.order.code ?? null,
      createdAt: t.createdAt,
    })),
    withdrawals: withdrawals.map((w) => ({
      id: w.id,
      amountSatang: w.amountSatang,
      status: w.status,
      note: w.note,
      bank: JSON.parse(w.bankJson) as Record<string, string>,
      createdAt: w.createdAt,
      processedAt: w.processedAt,
    })),
  });
});
