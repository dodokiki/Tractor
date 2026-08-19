import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, readBody } from "../../../_lib/http";
import { serviceStatus } from "../../../_lib/rodlex";

/** อัปเดตสถานะคำขอเรียกช่าง: NEW → CONTACTED → CLOSED */
export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const admin = await requireUser("ADMIN");
    const { id } = await ctx.params;
    const current = await db.serviceRequest.findUnique({ where: { id } });
    if (!current) return fail("ไม่พบคำขอเรียกช่างนี้", 404);

    const b = await readBody<Record<string, unknown>>(req);
    const status = serviceStatus(b.status);
    if (!status) return fail("สถานะไม่ถูกต้อง (NEW/CONTACTED/CLOSED)");

    const request = await db.serviceRequest.update({
      where: { id },
      data: { status },
    });
    await audit(db, {
      userId: admin.id,
      action: "SERVICE_REQUEST_STATUS",
      entity: "ServiceRequest",
      entityId: id,
      detail: { from: current.status, to: status },
    });
    return ok({ request });
  },
);
