import Link from "next/link";
import { AvatarCircle } from "../avatar";
import { relativeTimeTh } from "../time";
import type { TileImage } from "../image";
import { ThreadGallery, isRowLayout } from "./thread-gallery";
import { LikeButton } from "./like-button";

export type ThreadCardData = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: Date;
  images: TileImage[];
  likeCount: number;
  liked: boolean;
  replyCount: number;
};

export function ThreadCard({
  thread,
  loggedIn,
}: {
  thread: ThreadCardData;
  loggedIn: boolean;
}) {
  const row = isRowLayout(thread.images.length);

  return (
    <article className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
      <Link
        href={`/forum/${thread.id}`}
        className={`flex gap-3 ${row ? "flex-row items-start" : "flex-col"}`}
      >
        <ThreadGallery images={thread.images} />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-base font-bold text-ink sm:text-lg">{thread.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-ink/70">{thread.body}</p>
        </div>
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <AvatarCircle name={thread.authorName} />
          <span className="truncate text-sm font-semibold text-ink">{thread.authorName}</span>
          <span className="shrink-0 text-xs text-muted">{relativeTimeTh(thread.createdAt)}</span>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <LikeButton
            threadId={thread.id}
            initialCount={thread.likeCount}
            initialLiked={thread.liked}
            loggedIn={loggedIn}
          />
          <Link
            href={`/forum/${thread.id}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-[#1B7A43]"
          >
            <span aria-hidden>💬</span>
            {thread.replyCount.toLocaleString("th-TH")} ถาม-ตอบ
          </Link>
        </div>
      </div>
    </article>
  );
}
