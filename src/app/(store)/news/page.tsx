import Link from "next/link";
import type { NewsGroup, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { parseProductImage } from "@/components/store/image";
import { ProductImage } from "@/components/store/product-image";
import { NEWS_GROUPS, newsGroupMeta } from "@/components/store/news-meta";

const PAGE_SIZE = 9;

type SearchParams = { group?: string; q?: string; page?: string };

const DIVIDER_THEMES = [
  { bg: "#14351f", label: "งานซ่อม งาน Custom ทำจบครบที่รถเหล็ก" },
  { bg: "#7a4a1f", label: "ครบเครื่องเรื่องอะไหล่แท้ ส่งไวทั่วไทย" },
];

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const group = sp.group?.trim() || undefined;
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.NewsArticleWhereInput = {};
  if (group) where.group = group as NewsGroup;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { tags: { contains: q } },
    ];
  }

  const [total, articles] = await Promise.all([
    db.newsArticle.count({ where }),
    db.newsArticle.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    if (group) params.set("group", group);
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/news?${params.toString()}`;
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-3 py-6 sm:px-6 sm:py-10">
      <div>
        <h1 className="text-xl font-bold text-ink sm:text-2xl">ข่าวสารและบทความ</h1>
        <p className="text-sm text-muted">ข่าวเครื่องจักรก่อสร้าง เครื่องจักรเกษตร และแพลตฟอร์มรถเหล็ก</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Link
            href={q ? `/news?q=${encodeURIComponent(q)}` : "/news"}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              !group ? "bg-primary text-white" : "bg-white text-ink ring-1 ring-line hover:bg-surface"
            }`}
          >
            ทั้งหมด
          </Link>
          {NEWS_GROUPS.map((g) => {
            const params = new URLSearchParams();
            params.set("group", g.value);
            if (q) params.set("q", q);
            return (
              <Link
                key={g.value}
                href={`/news?${params.toString()}`}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  group === g.value
                    ? "bg-primary text-white"
                    : "bg-white text-ink ring-1 ring-line hover:bg-surface"
                }`}
              >
                {g.emoji} {g.label}
              </Link>
            );
          })}
        </div>

        <form action="/news" method="get" className="flex shrink-0 items-center gap-2">
          {group && <input type="hidden" name="group" value={group} />}
          <div className="flex items-center rounded-full bg-white shadow-inner ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-primary">
            <span className="pl-3 text-muted" aria-hidden>
              🔍
            </span>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="ค้นหาข่าว..."
              className="w-44 bg-transparent px-2 py-2 text-sm text-ink placeholder:text-muted focus:outline-none sm:w-56"
            />
          </div>
        </form>
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
          <span className="text-5xl" aria-hidden>
            📰
          </span>
          <p className="text-sm font-semibold text-ink">ยังไม่มีข่าวในหมวดนี้</p>
          <p className="text-xs text-muted">ทีมงานกำลังเตรียมเนื้อหาข่าวสารเพิ่มเติม โปรดกลับมาดูใหม่อีกครั้ง</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {articles.map((a, idx) => {
            const img = parseProductImage(a.imageJson);
            const meta = newsGroupMeta(a.group);
            const imageRight = idx % 2 === 1;
            const showDivider = idx > 0 && idx % 3 === 0;
            const theme = DIVIDER_THEMES[(Math.floor(idx / 3) - 1) % DIVIDER_THEMES.length];

            return (
              <div key={a.id} className="contents">
                {showDivider && (
                  <div
                    className="flex items-center justify-center rounded-3xl px-6 py-8 text-center text-white shadow-lg"
                    style={{ background: theme.bg }}
                  >
                    <p className="text-base font-bold sm:text-lg">{theme.label}</p>
                  </div>
                )}
                <Link
                  href={`/news/${a.id}`}
                  className={`group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-xl sm:grid sm:grid-cols-2 sm:items-stretch ${
                    imageRight ? "sm:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <ProductImage image={img} size="lg" rounded="rounded-none" className="aspect-[16/10] sm:aspect-auto" />
                  <div className="flex flex-col justify-center gap-3 p-5 sm:p-8">
                    <span className="w-fit rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-muted">
                      {meta.emoji} {meta.label}
                    </span>
                    <p className="text-lg font-extrabold text-ink transition-colors group-hover:text-primary sm:text-xl">
                      {a.title}
                    </p>
                    <p className="line-clamp-3 text-sm text-muted">{a.excerpt}</p>
                    <p className="text-xs text-muted">
                      {new Date(a.publishedAt).toLocaleDateString("th-TH", { dateStyle: "long" })}
                    </p>
                    <span className="link-indigo text-sm font-bold">อ่านต่อ →</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={hrefFor(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                p === page ? "bg-primary text-white" : "text-ink hover:bg-white"
              }`}
            >
              {p}
            </Link>
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
      )}
    </div>
  );
}
