import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { creditPendingOnPaid } from "@/lib/wallet";
import { audit, readBody, str } from "../../../../_lib/http";

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ orderId: string }> }) => {
    const admin = await requireUser("ADMIN");
    const { orderId } = await ctx.params;
    const b = await readBody<{ note?: string }>(req);
    const note = str(b.note);

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) return fail("ไม่พบคำสั่งซื้อนี้", 404);
    if (order.payment?.status === "PAID")
      return fail("คำสั่งซื้อนี้ยืนยันการชำระเงินไปแล้ว");
    if (order.status !== "PENDING_PAYMENT")
      return fail("คำสั่งซื้อนี้ไม่อยู่ในสถานะรอชำระเงิน");

    const payment = await db.$transaction(async (tx) => {
      const p = await tx.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          method: "BANK_TRANSFER",
          status: "PAID",
          amountSatang: order.totalSatang,
          paidAt: new Date(),
          slipNote: note ?? null,
          ref: `ADM-${Date.now().toString(36).toUpperCase()}`,
        },
        update: {
          status: "PAID",
          paidAt: new Date(),
          amountSatang: order.totalSatang,
          slipNote: note ?? order.payment?.slipNote ?? null,
          ref: `ADM-${Date.now().toString(36).toUpperCase()}`,
        },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });
      await creditPendingOnPaid(tx, order.id);
      await audit(tx, {
        userId: admin.id,
        action: "PAYMENT_CONFIRM",
        entity: "Order",
        entityId: order.id,
        detail: { amountSatang: order.totalSatang, note, by: "admin" },
      });
      return p;
    });

    return ok({ status: "PAID", paymentId: payment.id });
  },
);
