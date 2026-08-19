import Link from "next/link";
import { parseProductImage } from "./image";
import { ProductImage } from "./product-image";
import { newsGroupMeta } from "./news-meta";

export type NewsCardData = {
  id: string;
  title: string;
  excerpt: string;
  group: string;
  imageJson: string;
  publishedAt: string | Date;
};

/** การ์ดข่าวย่อ — ใช้ในหน้าแรก (ข่าวล่าสุด) และข่าวที่เกี่ยวข้องในหน้า /news/[id] */
export function NewsCard({ article }: { article: NewsCardData }) {
  const img = parseProductImage(article.imageJson);
  const meta = newsGroupMeta(article.group);

  return (
    <Link
      href={`/news/${article.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <ProductImage image={img} size="md" rounded="rounded-none" className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-muted">
          {meta.emoji} {meta.label}
        </span>
        <p className="line-clamp-2 text-sm font-bold text-ink transition-colors group-hover:text-primary sm:text-base">
          {article.title}
        </p>
        <p className="line-clamp-2 text-xs text-muted">{article.excerpt}</p>
        <p className="mt-auto pt-1 text-[11px] text-muted">
          {new Date(article.publishedAt).toLocaleDateString("th-TH", { dateStyle: "medium" })}
        </p>
      </div>
    </Link>
  );
}
