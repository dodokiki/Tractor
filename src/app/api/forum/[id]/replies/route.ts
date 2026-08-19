import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { readBody, str } from "../../../_lib/http";

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await ctx.params;
    const thread = await db.forumThread.findUnique({ where: { id } });
    if (!thread) return fail("ไม่พบกระทู้นี้", 404);

    const b = await readBody<Record<string, unknown>>(req);
    const body = str(b.body);
    if (!body) return fail("กรุณากรอกข้อความตอบกลับ");

    const reply = await db.forumReply.create({
      data: { threadId: id, authorId: user.id, body },
    });
    const replyCount = await db.forumReply.count({ where: { threadId: id } });

    return ok(
      {
        reply: {
          id: reply.id,
          body: reply.body,
          author: { id: user.id, name: user.name },
          createdAt: reply.createdAt,
        },
        replyCount,
      },
      { status: 201 },
    );
  },
);
