import { formatBaht } from "@/lib/money";

export default function SalesBarChart({
  data,
}: {
  data: { label: string; satang: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.satang));
  return (
    <div className="flex h-48 items-end gap-3 sm:gap-4">
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const heightPct = Math.max(4, Math.round((d.satang / max) * 100));
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-36 w-full items-end">
              <div
                title={formatBaht(d.satang)}
                className={`w-full rounded-t-lg transition-all ${
                  isLast ? "bg-accent" : "bg-primary-light"
                }`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span className="text-xs text-muted">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
