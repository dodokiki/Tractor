import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const DELETE = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await ctx.params;
    const existing = await db.address.findUnique({ where: { id } });
    if (!existing || (existing.userId !== user.id && user.role !== "ADMIN"))
      return fail("ไม่พบที่อยู่นี้", 404);
    await db.address.delete({ where: { id } });
    return ok({ deleted: true });
  },
);
