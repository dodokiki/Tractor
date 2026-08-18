import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseAddress, parseImage } from "../../_lib/http";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await ctx.params;

    const o = await db.order.findFirst({
      where: { OR: [{ id }, { code: id }] },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        payment: true,
        subOrders: {
          include: {
            vendor: { select: { id: true, shopName: true, logoEmoji: true } },
            items: { include: { product: { select: { imageJson: true } } } },
          },
        },
      },
    });
    if (!o) return fail("ไม่พบคำสั่งซื้อนี้", 404);
    if (o.userId !== user.id && user.role !== "ADMIN")
      return fail("ไม่มีสิทธิ์ดูคำสั่งซื้อนี้", 403);

    return ok({
      order: {
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
        address: parseAddress(o.addressJson),
        payment: o.payment,
        subOrders: o.subOrders.map((s) => ({
          id: s.id,
          status: s.status,
          itemsSatang: s.itemsSatang,
          commissionSatang: s.commissionSatang,
          netSatang: s.netSatang,
          settledAt: s.settledAt,
          vendor: s.vendor,
          items: s.items.map((it) => ({
            id: it.id,
            productId: it.productId,
            name: it.nameSnapshot,
            priceSatang: it.priceSatang,
            qty: it.qty,
            image: parseImage(it.product?.imageJson),
          })),
        })),
      },
    });
  },
);
