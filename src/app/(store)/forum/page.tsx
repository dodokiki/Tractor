import type { Prisma, ForumCategory } from "@prisma/client";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { parseTileImages } from "@/components/store/rodlex/image";
import { ForumTabs } from "@/components/store/rodlex/forum/forum-tabs";
import { NewThreadForm } from "@/components/store/rodlex/forum/new-thread-form";
import { ThreadCard, type ThreadCardData } from "@/components/store/rodlex/forum/thread-card";
import { RodlexPagination } from "@/components/store/rodlex/pagination";
import { FORUM_TABS } from "@/components/store/rodlex/forum/constants";

const PAGE_SIZE = 8;

type SearchParams = { category?: string; page?: string };

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const category = sp.category?.trim() as ForumCategory | undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const [user, total, threads] = await Promise.all([
    getSessionUser(),
    db.forumThread.count({ where: category ? { category } : undefined }),
    db.forumThread.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { replies: true } } },
    }),
  ]);

  const authorIds = [...new Set(threads.map((t) => t.authorId))];
  const [authors, likedRows] = await Promise.all([
    authorIds.length
      ? db.user.findMany({ where: { id: { in: authorIds } }, select: { id: true, name: true } })
      : Promise.resolve([]),
    user && threads.length
      ? db.forumLike.findMany({
          where: { userId: user.id, threadId: { in: threads.map((t) => t.id) } },
          select: { threadId: true },
        })
      : Promise.resolve([]),
  ]);
  const authorMap = new Map(authors.map((a) => [a.id, a.name]));
  const likedSet = new Set(likedRows.map((r) => r.threadId));

  const cards: ThreadCardData[] = threads.map((t) => ({
    id: t.id,
    title: t.title,
    body: t.body,
    authorName: authorMap.get(t.authorId) ?? "ผู้ใช้ Rodlex",
    createdAt: t.createdAt,
    images: parseTileImages(t.imagesJson),
    likeCount: t.likeCount,
    liked: likedSet.has(t.id),
    replyCount: t._count.replies,
  }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-3 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">กระทู้ถาม-ตอบ</h1>
        <NewThreadForm loggedIn={!!user} />
      </div>

      <ForumTabs tabs={FORUM_TABS} active={category} />

      {cards.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
          <span className="text-5xl" aria-hidden>
            💬
          </span>
          <p className="mt-2 font-bold text-ink">ยังไม่มีกระทู้ในหมวดนี้</p>
          <p className="text-sm text-muted">เป็นคนแรกที่ตั้งกระทู้ในหมวดนี้เลย!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {cards.map((t) => (
            <ThreadCard key={t.id} thread={t} loggedIn={!!user} />
          ))}
        </div>
      )}

      <RodlexPagination basePath="/forum" page={page} totalPages={totalPages} searchParams={{ category }} />
    </div>
  );
}
