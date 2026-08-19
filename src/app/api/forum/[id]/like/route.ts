import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

/** กด ❤️ ถูกใจ — toggle: มีอยู่แล้วจะถอนถูกใจ, ยังไม่มีจะเพิ่ม (นับ likeCount ใน transaction เดียวกัน) */
export const POST = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await ctx.params;
    const thread = await db.forumThread.findUnique({ where: { id } });
    if (!thread) return fail("ไม่พบกระทู้นี้", 404);

    const key = { threadId_userId: { threadId: id, userId: user.id } };
    const existing = await db.forumLike.findUnique({ where: key });

    const updated = await db.$transaction(async (tx) => {
      if (existing) {
        await tx.forumLike.delete({ where: key });
        return tx.forumThread.update({
          where: { id },
          data: { likeCount: { decrement: 1 } },
        });
      }
      await tx.forumLike.create({ data: { threadId: id, userId: user.id } });
      return tx.forumThread.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      });
    });

    // กันค่าติดลบถ้าข้อมูลเคยเพี้ยน
    const likeCount = Math.max(0, updated.likeCount);
    if (likeCount !== updated.likeCount)
      await db.forumThread.update({ where: { id }, data: { likeCount } });

    return ok({ liked: !existing, likeCount });
  },
);
