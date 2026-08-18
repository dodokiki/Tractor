import type { Prisma } from "@prisma/client";
import { handler, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { parseAddress, parseImage, str } from "../../_lib/http";
import { requireVendor } from "../../_lib/vendor";

export const GET = handler(async (req: Request) => {
  const vendor = await requireVendor(req);
  const status = str(new URL(req.url).searchParams.get("status"));

  const where: Prisma.SubOrderWhereInput = { vendorId: vendor.id };
  if (status) where.status = status as Prisma.SubOrderWhereInput["status"];

  const rows = await db.subOrder.findMany({
    where,
    orderBy: { order: { createdAt: "desc" } },
    include: {
      order: {
        include: {
          user: { select: { id: true, name: true, phone: true } },
          payment: { select: { status: true, method: true } },
        },
      },
      items: { include: { product: { select: { imageJson: true } } } },
    },
  });

  return ok({
    subOrders: rows.map((s) => ({
      id: s.id,
      status: s.status,
      itemsSatang: s.itemsSatang,
      commissionSatang: s.commissionSatang,
      netSatang: s.netSatang,
      settledAt: s.settledAt,
      orderId: s.orderId,
      orderCode: s.order.code,
      orderStatus: s.order.status,
      paymentStatus: s.order.payment?.status ?? null,
      paymentMethod: s.order.payment?.method ?? null,
      createdAt: s.order.createdAt,
      customer: s.order.user,
      address: parseAddress(s.order.addressJson),
      items: s.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.nameSnapshot,
        priceSatang: it.priceSatang,
        qty: it.qty,
        image: parseImage(it.product?.imageJson),
      })),
    })),
  });
});
