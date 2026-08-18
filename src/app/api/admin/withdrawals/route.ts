import type { Prisma } from "@prisma/client";
import { handler, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { str } from "../../_lib/http";

export const GET = handler(async (req: Request) => {
  await requireUser("ADMIN");
  const status = str(new URL(req.url).searchParams.get("status"));

  const where: Prisma.WithdrawalRequestWhereInput = {};
  if (status && status !== "ALL")
    where.status = status as Prisma.WithdrawalRequestWhereInput["status"];

  const rows = await db.withdrawalRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      vendor: {
        select: {
          id: true,
          shopName: true,
          logoEmoji: true,
          wallet: { select: { balanceSatang: true, pendingSatang: true } },
        },
      },
    },
  });

  return ok({
    withdrawals: rows.map((w) => ({
      id: w.id,
      amountSatang: w.amountSatang,
      status: w.status,
      note: w.note,
      bank: JSON.parse(w.bankJson) as Record<string, string>,
      createdAt: w.createdAt,
      processedAt: w.processedAt,
      vendor: {
        id: w.vendor.id,
        shopName: w.vendor.shopName,
        logoEmoji: w.vendor.logoEmoji,
        balanceSatang: w.vendor.wallet?.balanceSatang ?? 0,
        pendingSatang: w.vendor.wallet?.pendingSatang ?? 0,
      },
    })),
  });
});
