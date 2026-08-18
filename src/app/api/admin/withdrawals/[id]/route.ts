import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { rejectWithdrawal } from "@/lib/wallet";
import { audit, readBody, str } from "../../../_lib/http";

const ACTIONS = ["APPROVE", "REJECT", "MARK_PAID"] as const;
type Action = (typeof ACTIONS)[number];

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const admin = await requireUser("ADMIN");
    const { id } = await ctx.params;
    const b = await readBody<{ action?: string; note?: string }>(req);
    const action = str(b.action)?.toUpperCase() as Action | undefined;
    const note = str(b.note);
    if (!action || !ACTIONS.includes(action))
      return fail("คำสั่งไม่ถูกต้อง (APPROVE / REJECT / MARK_PAID)");

    const wd = await db.withdrawalRequest.findUnique({ where: { id } });
    if (!wd) return fail("ไม่พบคำขอถอนเงินนี้", 404);

    if (action === "REJECT") {
      if (wd.status !== "PENDING") return fail("คำขอนี้ถูกดำเนินการไปแล้ว");
      try {
        const updated = await rejectWithdrawal(id, note);
        await audit(db, {
          userId: admin.id,
          action: "WITHDRAWAL_REJECT",
          entity: "WithdrawalRequest",
          entityId: id,
          detail: { amountSatang: wd.amountSatang, note },
        });
        return ok({ withdrawal: updated });
      } catch (e) {
        return fail(e instanceof Error ? e.message : "ปฏิเสธคำขอไม่สำเร็จ");
      }
    }

    if (action === "APPROVE" && wd.status !== "PENDING")
      return fail("คำขอนี้ถูกดำเนินการไปแล้ว");
    if (action === "MARK_PAID" && wd.status === "REJECTED")
      return fail("คำขอนี้ถูกปฏิเสธไปแล้ว");
    if (wd.status === "PAID") return fail("คำขอนี้จ่ายเงินเรียบร้อยแล้ว");

    const updated = await db.withdrawalRequest.update({
      where: { id },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "PAID",
        note: note ?? wd.note,
        processedAt: new Date(),
      },
    });
    await audit(db, {
      userId: admin.id,
      action: action === "APPROVE" ? "WITHDRAWAL_APPROVE" : "WITHDRAWAL_MARK_PAID",
      entity: "WithdrawalRequest",
      entityId: id,
      detail: { amountSatang: wd.amountSatang, note },
    });
    return ok({ withdrawal: updated });
  },
);
