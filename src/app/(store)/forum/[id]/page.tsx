import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { parseTileImages } from "@/components/store/rodlex/image";
import { ThreadGallery, isRowLayout } from "@/components/store/rodlex/forum/thread-gallery";
import { LikeButton } from "@/components/store/rodlex/forum/like-button";
import { ReplyForm } from "@/components/store/rodlex/forum/reply-form";
import { AvatarCircle } from "@/components/store/rodlex/avatar";
import { relativeTimeTh } from "@/components/store/rodlex/time";
import { FORUM_CATEGORY_LABEL } from "@/components/store/rodlex/forum/constants";

export default async function ForumThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user, thread] = await Promise.all([
    getSessionUser(),
    db.forumThread.findUnique({
      where: { id },
      include: { _count: { select: { replies: true } } },
    }),
  ]);
  if (!thread) notFound();

  const replies = await db.forumReply.findMany({
    where: { threadId: id },
    orderBy: { createdAt: "asc" },
  });

  const authorIds = [...new Set([thread.authorId, ...replies.map((r) => r.authorId)])];
  const [authors, likeRow] = await Promise.all([
    db.user.findMany({ where: { id: { in: authorIds } }, select: { id: true, name: true } }),
    user
      ? db.forumLike.findUnique({
          where: { threadId_userId: { threadId: id, userId: user.id } },
        })
      : Promise.resolve(null),
  ]);
  const authorMap = new Map(authors.map((a) => [a.id, a.name]));
  const images = parseTileImages(thread.imagesJson);
  const row = isRowLayout(images.length);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-3 py-6 sm:px-6 sm:py-10">
      <Link href="/forum" className="text-sm font-semibold text-[#4F46E5] hover:underline">
        ← กลับไปหน้ากระทู้ถาม-ตอบ
      </Link>

      <article className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
        <span className="w-fit rounded-full bg-[#1B7A43]/10 px-2.5 py-1 text-xs font-bold text-[#1B7A43]">
          {FORUM_CATEGORY_LABEL[thread.category]}
        </span>

        <div className={`flex gap-4 ${row ? "flex-row items-start" : "flex-col"}`}>
          <ThreadGallery images={images} />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold text-ink sm:text-2xl">{thread.title}</h1>
            <p className="mt-2 whitespace-pre-line text-sm text-ink/80 sm:text-base">{thread.body}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div className="flex items-center gap-2">
            <AvatarCircle name={authorMap.get(thread.authorId) ?? "ผู้ใช้ Rodlex"} size="md" />
            <div>
              <p className="text-sm font-semibold text-ink">
                {authorMap.get(thread.authorId) ?? "ผู้ใช้ Rodlex"}
              </p>
              <p className="text-xs text-muted">{relativeTimeTh(thread.createdAt)}</p>
            </div>
          </div>
          <LikeButton
            threadId={thread.id}
            initialCount={thread.likeCount}
            initialLiked={!!likeRow}
            loggedIn={!!user}
          />
        </div>
      </article>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-extrabold text-[#1B7A43] sm:text-lg">
          💬 {thread._count.replies.toLocaleString("th-TH")} ถาม-ตอบ
        </h2>

        {replies.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-sm text-muted shadow-sm ring-1 ring-black/5">
            ยังไม่มีคำตอบ เป็นคนแรกที่ช่วยตอบกระทู้นี้เลย
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {replies.map((r) => (
              <div
                key={r.id}
                className="flex gap-2.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
              >
                <AvatarCircle name={authorMap.get(r.authorId) ?? "ผู้ใช้ Rodlex"} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-semibold text-ink">
                      {authorMap.get(r.authorId) ?? "ผู้ใช้ Rodlex"}
                    </span>
                    <span className="text-xs text-muted">{relativeTimeTh(r.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-ink/80">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
          <ReplyForm threadId={thread.id} loggedIn={!!user} />
        </div>
      </section>
    </div>
  );
}
