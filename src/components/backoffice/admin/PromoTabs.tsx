import Link from "next/link";

export default function PromoTabs({ active }: { active: "coupons" | "banners" }) {
  const tabs = [
    { href: "/admin/coupons", key: "coupons", label: "คูปอง" },
    { href: "/admin/banners", key: "banners", label: "แบนเนอร์" },
  ] as const;

  return (
    <div className="flex gap-2 border-b border-line">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
            active === t.key
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
