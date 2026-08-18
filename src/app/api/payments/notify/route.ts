import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, readBody, str } from "../../_lib/http";

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const b = await readBody<{ orderId?: string; slipNote?: string }>(req);
  const orderId = str(b.orderId);
  const slipNote = str(b.slipNote) ?? "ลูกค้าแจ้งโอนเงินแล้ว";
  if (!orderId) return fail("ไม่พบรหัสคำสั่งซื้อ");

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order) return fail("ไม่พบคำสั่งซื้อนี้", 404);
  if (order.userId !== user.id && user.role !== "ADMIN")
    return fail("ไม่มีสิทธิ์ดำเนินการกับคำสั่งซื้อนี้", 403);
  if (order.payment?.status === "PAID")
    return fail("คำสั่งซื้อนี้ชำระเงินเรียบร้อยแล้ว");

  const payment = await db.payment.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      method: "BANK_TRANSFER",
      status: "PENDING",
      amountSatang: order.totalSatang,
      slipNote,
    },
    update: { slipNote },
  });

  await audit(db, {
    userId: user.id,
    action: "PAYMENT_NOTIFY",
    entity: "Order",
    entityId: order.id,
    detail: { slipNote, method: payment.method },
  });

  return ok({ notified: true, status: payment.status });
});
