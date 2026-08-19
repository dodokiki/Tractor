import Link from "next/link";

/** เพจจิเนชันแบบ query ?page= ใช้ได้กับทุก basePath (ทีมช่าง/ร้านอะไหล่) */
export function RodlexPagination({
  basePath,
  page,
  totalPages,
  searchParams,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== "page" && value) params.set(key, value);
    }
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="mt-2 flex items-center justify-center gap-1.5" aria-label="เปลี่ยนหน้า">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`rounded-full px-3 py-1.5 text-sm font-medium ${
          page === 1 ? "pointer-events-none text-line" : "text-ink hover:bg-white"
        }`}
      >
        ก่อนหน้า
      </Link>
      {pages.map((p, idx) => (
        <span key={p} className="flex items-center gap-1.5">
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="text-muted">…</span>}
          <Link
            href={hrefFor(p)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              p === page ? "bg-[#1B7A43] text-white" : "text-ink hover:bg-white"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`rounded-full px-3 py-1.5 text-sm font-medium ${
          page === totalPages ? "pointer-events-none text-line" : "text-ink hover:bg-white"
        }`}
      >
        ถัดไป
      </Link>
    </nav>
  );
}
