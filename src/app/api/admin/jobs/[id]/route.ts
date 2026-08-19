import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { readBody } from "../../../_lib/http";
import { applyJobPatch } from "../_update";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await requireUser("ADMIN");
    const { id } = await ctx.params;
    const job = await db.jobPosting.findUnique({
      where: { id },
      include: { applications: { orderBy: { createdAt: "desc" } } },
    });
    if (!job) return fail("ไม่พบตำแหน่งงานนี้", 404);
    return ok({ job });
  },
);

export const PATCH = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const admin = await requireUser("ADMIN");
    const { id } = await ctx.params;
    const b = await readBody<Record<string, unknown>>(req);
    return applyJobPatch(admin.id, id, b);
  },
);
