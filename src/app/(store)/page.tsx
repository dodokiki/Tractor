import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";
import { NewsCard } from "@/components/store/news-card";
import { parseProductImage } from "@/components/store/image";
import { ProductImage } from "@/components/store/product-image";
import { StarRating } from "@/components/store/star-rating";

async function getData() {
  const [categories, topProductsRaw, newsArticles, techniciansRaw] = await Promise.all([
    db.category.findMany({
      orderBy: [{ sort: "asc" }, { name: "asc" }],
      take: 8,
      select: { id: true, name: true, slug: true, emoji: true },
    }),
    db.product.findMany({
      where: { active: true },
      orderBy: [{ reviews: { _count: "desc" } }, { createdAt: "desc" }],
      take: 8,
      include: { vendor: { select: { id: true, shopName: true } } },
    }),
    db.newsArticle.findMany({
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    db.technician.findMany({
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
      take: 4,
    }),
  ]);

  const ratings = topProductsRaw.length
    ? await db.review.groupBy({
        by: ["productId"],
        where: { productId: { in: topProductsRaw.map((p) => p.id) } },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];
  const ratingMap = new Map(
    ratings.map((r) => [
      r.productId,
      {
        avgRating: r._avg.rating ? Math.round(r._avg.rating * 10) / 10 : 0,
        reviewCount: r._count.rating,
      },
    ]),
  );

  const topProducts = topProductsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    priceSatang: p.priceSatang,
    imageJson: p.imageJson,
    stock: p.stock,
    vendor: p.vendor,
    avgRating: ratingMap.get(p.id)?.avgRating ?? 0,
    reviewCount: ratingMap.get(p.id)?.reviewCount ?? 0,
  }));

  return { categories, topProducts, newsArticles, technicians: techniciansRaw };
}

const BANNER_CARDS = [
  { title: "รถเหล็ก STORE", subtitle: "SERVICES · PARTS", from: "#8CC63F", to: "#1B7A43" },
  { title: "งานก่อสร้าง", subtitle: "รถขุด รถตัก รถบด", from: "#F5862B", to: "#D9631A" },
  { title: "งานเกษตร", subtitle: "แทรกเตอร์ รถเกี่ยว", from: "#22C55E", to: "#0F7A3D" },
  { title: "งาน Custom", subtitle: "ดัดแปลงตามสั่ง", from: "#8B5CF6", to: "#4F46E5" },
  { title: "เรียกช่างด่วน", subtitle: "ทั่วไทย 24 ชม.", from: "#EC4899", to: "#DB2777" },
];

export default async function HomePage() {
  const { categories, topProducts, newsArticles, technicians } = await getData();

  return (
    <div className="flex flex-col gap-10 pb-6 sm:gap-14 sm:pb-10">
      {/* Hero */}
      <section className="bg-surface">
        <div className="mx-auto max-w-4xl px-3 py-14 text-center sm:px-6 sm:py-20">
          <h1 className="text-gradient-hero text-2xl font-extrabold leading-snug sm:text-4xl lg:text-5xl">
            &ldquo;งานซ่อม งาน Custom ทำจบครบที่รถเหล็ก&rdquo;
          </h1>
          <p className="mt-5 text-base font-semibold text-primary sm:text-xl">
            ช่างไทยหัวใจแกร่ง เร็ว แรง ฉับไว ให้เราบริการ งานดี งานคุณภาพ
          </p>
          <p className="mt-2 text-base font-semibold text-[#8b5cf6] sm:text-lg">ครบเครื่องเรื่องอะไหล่แท้</p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/call"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 sm:text-base"
            >
              🔧 เรียกช่างตอนนี้
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full border-2 border-primary/30 bg-white px-6 py-3 text-sm font-bold text-primary transition hover:-translate-y-0.5 hover:bg-primary/5 sm:text-base"
            >
              🛒 เลือกซื้ออะไหล่
            </Link>
          </div>
        </div>

        {/* แบนเนอร์แบรนด์ — carousel แนวนอน 5 ใบ */}
        <div className="mx-auto max-w-6xl px-3 pb-2 sm:px-6">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
            {BANNER_CARDS.map((b) => (
              <div
                key={b.title}
                className="relative flex h-48 w-64 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl p-5 text-white shadow-lg sm:h-56 sm:w-80"
                style={{ backgroundImage: `linear-gradient(135deg, ${b.from}, ${b.to})` }}
              >
                <div>
                  <p className="text-lg font-extrabold sm:text-xl">{b.title}</p>
                  <p className="text-xs font-medium text-white/85 sm:text-sm">{b.subtitle}</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/products/hero-tractor.svg"
                  alt=""
                  aria-hidden
                  className="absolute -bottom-4 -right-4 w-36 opacity-90 drop-shadow-xl sm:w-44"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-3 sm:gap-14 sm:px-6">
        {/* Categories */}
        <section id="categories" className="scroll-mt-24">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink sm:text-xl">หมวดหมู่สินค้า</h2>
            <Link href="/products" className="link-indigo text-sm font-medium hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${encodeURIComponent(c.slug)}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-transparent bg-white p-4 text-center shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-6"
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-3xl transition-transform duration-200 group-hover:scale-110 sm:h-16 sm:w-16 sm:text-4xl"
                  aria-hidden
                >
                  {c.emoji}
                </span>
                <span className="text-xs font-semibold text-ink sm:text-sm">{c.name}</span>
              </Link>
            ))}
            {categories.length === 0 && (
              <p className="col-span-full text-sm text-muted">ยังไม่มีหมวดหมู่สินค้า</p>
            )}
          </div>
        </section>

        {/* Best sellers */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink sm:text-xl">สินค้าขายดี</h2>
            <Link href="/products?sort=popular" className="link-indigo text-sm font-medium hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {topProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {topProducts.length === 0 && (
              <p className="col-span-full text-sm text-muted">ยังไม่มีสินค้าในระบบ</p>
            )}
          </div>
        </section>

        {/* ข่าวล่าสุด */}
        {newsArticles.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink sm:text-xl">ข่าวล่าสุด</h2>
              <Link href="/news" className="link-indigo text-sm font-medium hover:underline">
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {newsArticles.map((n) => (
                <NewsCard key={n.id} article={n} />
              ))}
            </div>
          </section>
        )}

        {/* ทีมช่างแนะนำ */}
        {technicians.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink sm:text-xl">ทีมช่างแนะนำ</h2>
              <Link href="/technicians" className="link-indigo text-sm font-medium hover:underline">
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {technicians.map((t) => {
                const img = parseProductImage(t.imageJson);
                return (
                  <div
                    key={t.id}
                    className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative">
                      <ProductImage image={img} size="md" rounded="rounded-none" />
                      <span
                        className={`absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm ${
                          t.online ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`h-1.5 w-1.5 rounded-full ${t.online ? "bg-white" : "bg-white/60"}`}
                        />
                        {t.online ? "ออนไลน์" : "ออฟไลน์"}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <p className="truncate text-sm font-bold text-ink">{t.name}</p>
                      <p className="text-[11px] text-muted">{t.code}</p>
                      <StarRating rating={t.rating} reviewCount={t.reviewCount} />
                      <p className="mt-auto pt-1 text-[11px] text-muted">งานสำเร็จ {t.jobsDone} งาน</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
