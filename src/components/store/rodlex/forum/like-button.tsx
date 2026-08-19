"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

/** ปุ่มหัวใจ toggle ถูกใจกระทู้ — ถ้ายังไม่ login ให้พาไปหน้า /login ก่อน */
export function LikeButton({
  threadId,
  initialCount,
  initialLiked,
  loggedIn,
}: {
  threadId: string;
  initialCount: number;
  initialLiked: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn) {
      router.push("/login?next=/forum");
      return;
    }
    if (busy) return;
    setBusy(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));
    try {
      const res = await fetch(`/api/forum/${threadId}/like`, { method: "POST" });
      const json = (await res.json()) as ApiResponse<{ liked?: boolean; likeCount?: number }>;
      if (json.ok) {
        if (typeof json.data.liked === "boolean") setLiked(json.data.liked);
        if (typeof json.data.likeCount === "number") setCount(json.data.likeCount);
      } else {
        setLiked(!nextLiked);
        setCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
      }
    } catch {
      setLiked(!nextLiked);
      setCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`flex items-center gap-1.5 text-sm font-semibold transition disabled:opacity-60 ${
        liked ? "text-red-500" : "text-muted hover:text-red-500"
      }`}
    >
      <span aria-hidden>{liked ? "❤️" : "🤍"}</span>
      {count.toLocaleString("th-TH")} {liked ? "ถูกใจแล้ว" : "ถูกใจ"}
    </button>
  );
}
