export function StarRating({
  rating,
  reviewCount,
  size = "sm",
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(rating);
  const textSize = size === "md" ? "text-base" : "text-xs";
  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <span className="text-accent tracking-tight" aria-hidden>
        {"★".repeat(rounded)}
        <span className="text-line">{"★".repeat(5 - rounded)}</span>
      </span>
      <span className="text-muted">
        {rating > 0 ? rating.toFixed(1) : "ยังไม่มีรีวิว"}
        {typeof reviewCount === "number" && reviewCount > 0 ? ` (${reviewCount})` : ""}
      </span>
    </div>
  );
}
