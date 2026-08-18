import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";

async function getData() {
  const [banner, categories, topProductsRaw] = await Promise.all([
    db.banner.findFirst({ where: { active: true }, orderBy: [{ sort: "asc" }] }),
    db.category.findMany({
      orderBy: [{ sort: "asc" }, { name: "asc" }],
      take: 8,
      select: { id: true, name: true, slug: true, emoji: true },
    }),
    db.product.findMany({
      where: { active: true },
      orderBy: [{ reviews: { _count: "desc" } }, { createdAt: "desc" }],
      take: 8,
      include: { vendor: { select: { shopName: true } } },
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
    vendor: p.vendor,
    avgRating: ratingMap.get(p.id)?.avgRating ?? 0,
    reviewCount: ratingMap.get(p.id)?.reviewCount ?? 0,
  }));

  return { banner, categories, topProducts };
}

export default async function HomePage() {
  const { banner, categories, topProducts } = await getData();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-3 py-6 sm:px-6 sm:py-10">
      {/* Hero banner */}
      <section
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-light px-6 py-10 text-white shadow-sm sm:px-12 sm:py-16"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 text-[10rem] opacity-20 sm:text-[14rem]" aria-hidden>
          🚜
        </div>
        <div className="relative max-w-xl">
          <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl">
            {banner?.title ?? "อะไหล่รถแทรกเตอร์ครบวงจร ส่งตรงถึงไร่ของคุณ"}
          </h1>
          <p className="mt-3 text-sm text-white/90 sm:text-base">
            {banner?.subtitle ??
              "รวมร้านค้าพาร์ทเนอร์คุณภาพทั่วประเทศ เทียบราคาง่าย ตรงรุ่นรถแน่นอน"}
          </p>
          <Link
            href={banner?.ctaHref || "/products"}
            className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-accent-dark sm:text-base"
          >
            {banner?.ctaText || "เลือกซื้ออะไหล่เลย"}
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink sm:text-xl">หมวดหมู่สินค้า</h2>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${encodeURIComponent(c.slug)}`}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
            >
              <span className="text-3xl sm:text-4xl" aria-hidden>
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
          <Link href="/products?sort=popular" className="text-sm font-medium text-primary hover:underline">
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
    </div>
  );
}
