import { handler, ok, fail } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  authorMap,
  excerptOf,
  readImages,
  UNKNOWN_AUTHOR,
} from "../../_lib/rodlex";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const thread = await db.forumThread.findUnique({
      where: { id },
      include: { replies: { orderBy: { createdAt: "asc" } } },
    });
    if (!thread) return fail("ไม่พบกระทู้นี้", 404);

    const authors = await authorMap([
      thread.authorId,
      ...thread.replies.map((r) => r.authorId),
    ]);

    const me = await getSessionUser();
    const liked = me
      ? !!(await db.forumLike.findUnique({
          where: { threadId_userId: { threadId: thread.id, userId: me.id } },
        }))
      : false;

    return ok({
      thread: {
        id: thread.id,
        title: thread.title,
        body: thread.body,
        excerpt: excerptOf(thread.body),
        category: thread.category,
        images: readImages(thread.imagesJson),
        likeCount: thread.likeCount,
        replyCount: thread.replies.length,
        liked,
        author: authors.get(thread.authorId) ?? UNKNOWN_AUTHOR,
        createdAt: thread.createdAt,
        replies: thread.replies.map((r) => ({
          id: r.id,
          body: r.body,
          author: authors.get(r.authorId) ?? UNKNOWN_AUTHOR,
          createdAt: r.createdAt,
        })),
      },
    });
  },
);
