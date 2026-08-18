import type { PaymentMethod } from "@prisma/client";
import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isMockPayment, promptPayQrDataUrl } from "@/lib/payment";
import { creditPendingOnPaid } from "@/lib/wallet";
import { BANK_INFO, audit, readBody, str } from "../../_lib/http";

const METHODS: PaymentMethod[] = ["CARD", "BANK_TRANSFER", "PROMPTPAY"];

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const b = await readBody<{ orderId?: string; method?: string }>(req);
  const orderId = str(b.orderId);
  const method = str(b.method)?.toUpperCase() as PaymentMethod | undefined;
  if (!orderId) return fail("ไม่พบรหัสคำสั่งซื้อ");
  if (!method || !METHODS.includes(method))
    return fail("วิธีชำระเงินไม่ถูกต้อง");

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order) return fail("ไม่พบคำสั่งซื้อนี้", 404);
  if (order.userId !== user.id && user.role !== "ADMIN")
    return fail("ไม่มีสิทธิ์ชำระคำสั่งซื้อนี้", 403);
  if (order.payment?.status === "PAID")
    return ok({ status: "PAID", paymentId: order.payment.id, alreadyPaid: true });
  if (order.status !== "PENDING_PAYMENT")
    return fail("คำสั่งซื้อนี้ไม่อยู่ในสถานะรอชำระเงิน");

  // --- บัตรเครดิต (โหมด mock): สำเร็จทันที ---
  if (method === "CARD" && isMockPayment()) {
    const payment = await db.$transaction(async (tx) => {
      const p = await tx.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          method,
          status: "PAID",
          amountSatang: order.totalSatang,
          ref: `MOCK-${Date.now().toString(36).toUpperCase()}`,
          paidAt: new Date(),
        },
        update: {
          method,
          status: "PAID",
          amountSatang: order.totalSatang,
          ref: `MOCK-${Date.now().toString(36).toUpperCase()}`,
          paidAt: new Date(),
        },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });
      await creditPendingOnPaid(tx, order.id);
      await audit(tx, {
        userId: user.id,
        action: "PAYMENT_PAID",
        entity: "Order",
        entityId: order.id,
        detail: { method, amountSatang: order.totalSatang, via: "card-mock" },
      });
      return p;
    });
    return ok({ status: "PAID", paymentId: payment.id });
  }

  if (method === "CARD")
    return fail("ยังไม่ได้เชื่อมต่อเกตเวย์บัตรเครดิตในโหมดนี้", 501);

  // --- PromptPay / โอนเงิน: รอยืนยัน ---
  const payment = await db.payment.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      method,
      status: "PENDING",
      amountSatang: order.totalSatang,
    },
    update: { method, status: "PENDING", amountSatang: order.totalSatang },
  });
  await audit(db, {
    userId: user.id,
    action: "PAYMENT_INIT",
    entity: "Order",
    entityId: order.id,
    detail: { method, amountSatang: order.totalSatang },
  });

  if (method === "PROMPTPAY") {
    const qrDataUrl = await promptPayQrDataUrl(order.totalSatang);
    return ok({
      status: "PENDING",
      paymentId: payment.id,
      amountSatang: order.totalSatang,
      qrDataUrl,
    });
  }

  return ok({
    status: "PENDING",
    paymentId: payment.id,
    amountSatang: order.totalSatang,
    bankInfo: BANK_INFO,
  });
});
