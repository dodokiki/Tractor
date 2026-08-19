import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";
import { HeroImage } from "@/components/store/hero-image";

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
      include: { vendor: { select: { id: true, shopName: true } } },
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

  return { banner, categories, topProducts };
}

const TRUST_ITEMS = [
  "อะไหล่แท้รับประกัน",
  "ส่งไวทั่วไทย",
  "จ่ายปลอดภัย",
];

export default async function HomePage() {
  const { banner, categories, topProducts } = await getData();

  return (
    <div className="flex flex-col gap-10 py-6 sm:gap-14 sm:py-10">
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-3 py-10 sm:grid-cols-2 sm:px-6 sm:py-16 lg:gap-12">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/20">
              🚜 มาร์เก็ตเพลสอะไหล่แทรกเตอร์อันดับ 1
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              {banner?.title ?? "อะไหล่รถแทรกเตอร์ครบวงจร ส่งตรงถึงไร่ของคุณ"}
            </h1>
            <p className="mt-4 text-sm text-white/90 sm:text-base">
              {banner?.subtitle ??
                "รวมร้านค้าพาร์ทเนอร์คุณภาพทั่วประเทศ เทียบราคาง่าย ตรงรุ่นรถแน่นอน"}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={banner?.ctaHref || "/products"}
                className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-bold text-white shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:text-base"
              >
                {banner?.ctaText || "เลือกซื้ออะไหล่"}
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/70 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:text-base"
              >
                ดูวิธีใช้งาน
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/90 sm:text-sm">
              {TRUST_ITEMS.map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <span className="text-primary-light" aria-hidden>
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <HeroImage />
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-3 sm:gap-14 sm:px-6">
        {/* Categories */}
        <section id="categories" className="scroll-mt-24">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink sm:text-xl">หมวดหมู่สินค้า</h2>
            <Link
              href="/products"
              className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            >
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
            <Link
              href="/products?sort=popular"
              className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            >
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
    </div>
  );
}
