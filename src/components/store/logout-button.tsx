"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface disabled:opacity-60"
    >
      {loading ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
    </button>
  );
}
