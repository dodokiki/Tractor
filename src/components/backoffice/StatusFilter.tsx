"use client";

import { useRouter, usePathname } from "next/navigation";

export default function StatusFilter({
  value,
  options,
  paramName = "status",
}: {
  value: string;
  options: { value: string; label: string }[];
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        const qs = v ? `?${paramName}=${encodeURIComponent(v)}` : "";
        router.push(`${pathname}${qs}`);
      }}
      className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
