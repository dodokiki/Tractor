export default function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-line bg-white p-5 shadow-sm ${className}`}>
      {title || action ? (
        <div className="mb-4 flex items-center justify-between">
          {title ? <h2 className="text-base font-bold text-ink">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}
