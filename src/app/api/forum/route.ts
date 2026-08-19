import { Prisma } from "@prisma/client";
import { handler, ok, fail } from "@/lib/api";
import { getSessionUser, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { int, readBody, str } from "../_lib/http";
import {
  authorMap,
  excerptOf,
  forumCategory,
  paging,
  readImages,
  UNKNOWN_AUTHOR,
  writeImages,
} from "../_lib/rodlex";

const PAGE_SIZE = 10;

export const GET = handler(async (req: Request) => {
  const sp = new URL(req.url).searchParams;
  const category = forumCategory(sp.get("category"));
  const q = str(sp.get("q"));
  const { page, pageSize, skip, take } = paging(
    int(sp.get("page"), 1),
    Math.min(40, Math.max(1, int(sp.get("pageSize"), PAGE_SIZE) ?? PAGE_SIZE)),
  );

  const where: Prisma.ForumThreadWhereInput = {};
  if (category) where.category = category;
  if (q) where.OR = [{ title: { contains: q } }, { body: { contains: q } }];

  const [total, rows] = await Promise.all([
    db.forumThread.count({ where }),
    db.forumThread.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take,
      include: { _count: { select: { replies: true } } },
    }),
  ]);

  const authors = await authorMap(rows.map((t) => t.authorId));

  // ถ้า login อยู่ ให้บอกด้วยว่ากดถูกใจกระทู้ไหนไปแล้ว
  const me = await getSessionUser();
  const likedIds = me
    ? new Set(
        (
          await db.forumLike.findMany({
            where: { userId: me.id, threadId: { in: rows.map((t) => t.id) } },
            select: { threadId: true },
          })
        ).map((l) => l.threadId),
      )
    : new Set<string>();

  return ok({
    threads: rows.map((t) => ({
      id: t.id,
      title: t.title,
      body: t.body,
      excerpt: excerptOf(t.body),
      category: t.category,
      images: readImages(t.imagesJson),
      likeCount: t.likeCount,
      replyCount: t._count.replies,
      liked: likedIds.has(t.id),
      author: authors.get(t.authorId) ?? UNKNOWN_AUTHOR,
      createdAt: t.createdAt,
    })),
    total,
    page,
    pageSize,
  });
});

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const b = await readBody<Record<string, unknown>>(req);
  const title = str(b.title);
  const body = str(b.body);
  if (!title) return fail("กรุณากรอกหัวเรื่องกระทู้");
  if (!body) return fail("กรุณากรอกเนื้อหากระทู้");

  const thread = await db.forumThread.create({
    data: {
      authorId: user.id,
      title,
      body,
      category: forumCategory(b.category) ?? "REPAIR",
      imagesJson: writeImages(b.images),
    },
  });

  return ok(
    {
      thread: {
        id: thread.id,
        title: thread.title,
        body: thread.body,
        excerpt: excerptOf(thread.body),
        category: thread.category,
        images: readImages(thread.imagesJson),
        likeCount: 0,
        replyCount: 0,
        liked: false,
        author: { id: user.id, name: user.name },
        createdAt: thread.createdAt,
      },
    },
    { status: 201 },
  );
});
