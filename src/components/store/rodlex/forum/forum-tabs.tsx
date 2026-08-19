import Link from "next/link";

export type ForumTab = { label: string; value?: string };

export function ForumTabs({ tabs, active }: { tabs: ForumTab[]; active?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {tabs.map((t) => {
        const isActive = (t.value ?? "") === (active ?? "");
        return (
          <Link
            key={t.label}
            href={t.value ? `/forum?category=${t.value}` : "/forum"}
            className={`rounded-full px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
              isActive
                ? "bg-[#1B7A43] text-white"
                : "bg-white text-ink ring-1 ring-line hover:bg-[#1B7A43]/10 hover:text-[#1B7A43]"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
