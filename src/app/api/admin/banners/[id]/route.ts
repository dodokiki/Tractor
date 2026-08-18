import type { Prisma } from "@prisma/client";
import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, bool, int, readBody, str } from "../../../_lib/http";

export const PATCH = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const admin = await requireUser("ADMIN");
    const { id } = await ctx.params;
    const banner = await db.banner.findUnique({ where: { id } });
    if (!banner) return fail("ไม่พบแบนเนอร์นี้", 404);

    const b = await readBody<Record<string, unknown>>(req);
    const data: Prisma.BannerUpdateInput = {};
    const title = str(b.title);
    if (title) data.title = title;
    if (b.subtitle !== undefined) data.subtitle = str(b.subtitle) ?? null;
    if (b.ctaText !== undefined) data.ctaText = str(b.ctaText) ?? null;
    if (b.ctaHref !== undefined) data.ctaHref = str(b.ctaHref) ?? null;
    const active = bool(b.active);
    if (active !== undefined) data.active = active;
    const sort = int(b.sort);
    if (sort !== undefined) data.sort = sort;

    const updated = await db.banner.update({ where: { id }, data });
    await audit(db, {
      userId: admin.id,
      action: "BANNER_UPDATE",
      entity: "Banner",
      entityId: id,
      detail: { fields: Object.keys(data) },
    });
    return ok({ banner: updated });
  },
);

export const DELETE = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const admin = await requireUser("ADMIN");
    const { id } = await ctx.params;
    const banner = await db.banner.findUnique({ where: { id } });
    if (!banner) return fail("ไม่พบแบนเนอร์นี้", 404);
    await db.banner.delete({ where: { id } });
    await audit(db, {
      userId: admin.id,
      action: "BANNER_DELETE",
      entity: "Banner",
      entityId: id,
    });
    return ok({ deleted: true });
  },
);
