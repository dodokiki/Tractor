import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { parseProductImage } from "@/components/store/image";
import { ProductImage } from "@/components/store/product-image";
import { NewsCard } from "@/components/store/news-card";
import { newsGroupMeta } from "@/components/store/news-meta";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await db.newsArticle.findUnique({ where: { id } });
  if (!article) notFound();

  const meta = newsGroupMeta(article.group);
  const img = parseProductImage(article.imageJson);
  const paragraphs = article.body.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  const related = await db.newsArticle.findMany({
    where: { group: article.group, id: { not: article.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-3 py-6 sm:px-6 sm:py-10">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="breadcrumb">
        <Link href="/" className="hover:text-primary hover:underline">
          หน้าแรก
        </Link>
        <span aria-hidden>/</span>
        <Link href="/news" className="hover:text-primary hover:underline">
          ข่าว
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate text-ink">{article.title}</span>
      </nav>

      <div>
        <span className="w-fit rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-muted">
          {meta.emoji} {meta.label}
        </span>
        <h1 className="mt-3 text-2xl font-extrabold leading-snug text-ink sm:text-3xl">{article.title}</h1>
        <p className="mt-2 text-xs text-muted">
          เผยแพร่เมื่อ{" "}
          {new Date(article.publishedAt).toLocaleDateString("th-TH", { dateStyle: "long" })}
          {" · "}
          {meta.label}
        </p>
      </div>

      <ProductImage image={img} size="lg" rounded="rounded-3xl" className="aspect-[16/9] shadow-sm ring-1 ring-black/5" />

      <div className="flex flex-col gap-4 text-sm leading-relaxed text-ink sm:text-base">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, i) => <p key={i}>{p}</p>)
        ) : (
          <p className="text-muted">{article.excerpt}</p>
        )}
      </div>

      {article.tags && (
        <div className="flex flex-wrap gap-2">
          {article.tags.split(",").map((t) => (
            <span
              key={t}
              className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-line"
            >
              #{t.trim()}
            </span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-4">
          <h2 className="mb-4 text-lg font-bold text-ink">ข่าวที่เกี่ยวข้อง</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {related.map((n) => (
              <NewsCard key={n.id} article={n} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
