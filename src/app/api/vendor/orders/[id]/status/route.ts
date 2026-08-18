import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { settleSubOrder } from "@/lib/wallet";
import { audit, readBody, str } from "../../../../_lib/http";
import { requireVendor } from "../../../../_lib/vendor";

const ALLOWED = ["CONFIRMED", "SHIPPED", "COMPLETED"] as const;
type Allowed = (typeof ALLOWED)[number];

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const user = await requireUser("VENDOR");
    const vendor = await requireVendor(req);
    const { id } = await ctx.params;
    const b = await readBody<{ status?: string }>(req);
    const status = str(b.status)?.toUpperCase() as Allowed | undefined;
    if (!status || !ALLOWED.includes(status))
      return fail("สถานะไม่ถูกต้อง (CONFIRMED / SHIPPED / COMPLETED)");

    const sub = await db.subOrder.findUnique({ where: { id } });
    if (!sub || sub.vendorId !== vendor.id)
      return fail("ไม่พบคำสั่งซื้อของร้านคุณ", 404);
    if (sub.status === "AWAITING_PAYMENT")
      return fail("คำสั่งซื้อนี้ยังไม่ได้ชำระเงิน");
    if (sub.status === "CANCELLED") return fail("คำสั่งซื้อนี้ถูกยกเลิกแล้ว");
    if (sub.status === "COMPLETED") return fail("คำสั่งซื้อนี้ปิดงานแล้ว");

    if (status === "COMPLETED") {
      try {
        const updated = await settleSubOrder(sub.id);
        await audit(db, {
          userId: user.id,
          action: "SUBORDER_COMPLETED",
          entity: "SubOrder",
          entityId: sub.id,
          detail: { netSatang: updated.netSatang, vendorId: vendor.id },
        });
        return ok({ subOrder: updated });
      } catch (e) {
        return fail(e instanceof Error ? e.message : "ปิดงานไม่สำเร็จ");
      }
    }

    if (status === "SHIPPED" && sub.status !== "CONFIRMED")
      return fail("ต้องยืนยันคำสั่งซื้อก่อนจึงจะจัดส่งได้");
    if (status === "CONFIRMED" && sub.status !== "PENDING_CONFIRM")
      return fail("คำสั่งซื้อนี้ยืนยันไปแล้ว");

    const updated = await db.subOrder.update({
      where: { id: sub.id },
      data: { status },
    });
    await audit(db, {
      userId: user.id,
      action: `SUBORDER_${status}`,
      entity: "SubOrder",
      entityId: sub.id,
      detail: { vendorId: vendor.id },
    });
    return ok({ subOrder: updated });
  },
);
