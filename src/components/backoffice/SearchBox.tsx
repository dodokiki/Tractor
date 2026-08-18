"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function SearchBox({
  defaultValue,
  placeholder,
  paramName = "q",
}: {
  defaultValue: string;
  placeholder?: string;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(defaultValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const qs = value.trim() ? `?${paramName}=${encodeURIComponent(value.trim())}` : "";
    router.push(`${pathname}${qs}`);
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-64 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
      >
        ค้นหา
      </button>
    </form>
  );
}
