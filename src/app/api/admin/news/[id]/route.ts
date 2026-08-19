import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, readBody } from "../../../_lib/http";
import { applyNewsPatch } from "../_update";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await requireUser("ADMIN");
    const { id } = await ctx.params;
    const article = await db.newsArticle.findUnique({ where: { id } });
    if (!article) return fail("ไม่พบบทความนี้", 404);
    return ok({ article });
  },
);

export const PATCH = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const admin = await requireUser("ADMIN");
    const { id } = await ctx.params;
    const b = await readBody<Record<string, unknown>>(req);
    return applyNewsPatch(admin.id, id, b);
  },
);

export const DELETE = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const admin = await requireUser("ADMIN");
    const { id } = await ctx.params;
    const article = await db.newsArticle.findUnique({ where: { id } });
    if (!article) return fail("ไม่พบบทความนี้", 404);
    await db.newsArticle.delete({ where: { id } });
    await audit(db, {
      userId: admin.id,
      action: "NEWS_DELETE",
      entity: "NewsArticle",
      entityId: id,
    });
    return ok({ deleted: true });
  },
);
