import type { Prisma } from "@prisma/client";
import { handler, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { int, str } from "../../_lib/http";

export const GET = handler(async (req: Request) => {
  await requireUser("ADMIN");
  const sp = new URL(req.url).searchParams;
  const status = str(sp.get("status"));
  const q = str(sp.get("q"));
  const take = Math.min(200, int(sp.get("limit"), 100) ?? 100);

  const where: Prisma.OrderWhereInput = {};
  if (status && status !== "ALL")
    where.status = status as Prisma.OrderWhereInput["status"];
  if (q)
    where.OR = [
      { code: { contains: q } },
      { user: { name: { contains: q } } },
      { user: { phone: { contains: q } } },
    ];

  const rows = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
    include: {
      user: { select: { id: true, name: true, phone: true } },
      payment: true,
      subOrders: {
        select: {
          id: true,
          status: true,
          itemsSatang: true,
          vendor: { select: { id: true, shopName: true, logoEmoji: true } },
        },
      },
    },
  });

  return ok({
    orders: rows.map((o) => ({
      id: o.id,
      code: o.code,
      status: o.status,
      itemsSatang: o.itemsSatang,
      shippingSatang: o.shippingSatang,
      discountSatang: o.discountSatang,
      totalSatang: o.totalSatang,
      couponCode: o.couponCode,
      createdAt: o.createdAt,
      customer: o.user,
      payment: o.payment,
      subOrders: o.subOrders,
    })),
    total: rows.length,
  });
});
