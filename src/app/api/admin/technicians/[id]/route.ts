import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, readBody } from "../../../_lib/http";
import { applyTechnicianPatch } from "../_update";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await requireUser("ADMIN");
    const { id } = await ctx.params;
    const technician = await db.technician.findUnique({ where: { id } });
    if (!technician) return fail("ไม่พบช่างคนนี้", 404);
    return ok({ technician });
  },
);

export const PATCH = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const admin = await requireUser("ADMIN");
    const { id } = await ctx.params;
    const b = await readBody<Record<string, unknown>>(req);
    return applyTechnicianPatch(admin.id, id, b);
  },
);

export const DELETE = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const admin = await requireUser("ADMIN");
    const { id } = await ctx.params;
    const technician = await db.technician.findUnique({ where: { id } });
    if (!technician) return fail("ไม่พบช่างคนนี้", 404);
    await db.technician.delete({ where: { id } });
    await audit(db, {
      userId: admin.id,
      action: "TECHNICIAN_DELETE",
      entity: "Technician",
      entityId: id,
    });
    return ok({ deleted: true });
  },
);
