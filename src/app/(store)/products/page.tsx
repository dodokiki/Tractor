import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { bahtToSatang } from "@/lib/money";
import { ProductCard } from "@/components/store/product-card";
import { FiltersBar } from "@/components/store/filters-bar";
import { Pagination } from "@/components/store/pagination";

const PAGE_SIZE = 12;

type SearchParams = {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
  vendorId?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const category = sp.category?.trim() || undefined;
  const brand = sp.brand?.trim() || undefined;
  const sort = sp.sort || "new";
  const page = Math.max(1, Number(sp.page) || 1);
  const vendorId = sp.vendorId?.trim() || undefined;

  const where: Prisma.ProductWhereInput = { active: true };
  if (category) where.category = { OR: [{ slug: category }, { id: category }] };
  if (brand) where.brand = brand;
  if (vendorId) where.vendorId = vendorId;
  if (q)
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { partCode: { contains: q } },
      { sku: { contains: q } },
      { brand: { contains: q } },
    ];
  const minPriceSatang = sp.minPrice ? bahtToSatang(Number(sp.minPrice)) : undefined;
  const maxPriceSatang = sp.maxPrice ? bahtToSatang(Number(sp.maxPrice)) : undefined;
  if (minPriceSatang !== undefined || maxPriceSatang !== undefined) {
    where.priceSatang = {
      ...(minPriceSatang !== undefined ? { gte: minPriceSatang } : {}),
      ...(maxPriceSatang !== undefined ? { lte: maxPriceSatang } : {}),
    };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput[];
  switch (sort) {
    case "price_asc":
      orderBy = [{ priceSatang: "asc" }];
      break;
    case "price_desc":
      orderBy = [{ priceSatang: "desc" }];
      break;
    case "popular":
      orderBy = [{ reviews: { _count: "desc" } }, { createdAt: "desc" }];
      break;
    case "name":
      orderBy = [{ name: "asc" }];
      break;
    default:
      orderBy = [{ createdAt: "desc" }];
  }

  const [total, rows, categories, brandRows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { vendor: { select: { id: true, shopName: true } } },
    }),
    db.category.findMany({
      orderBy: [{ sort: "asc" }, { name: "asc" }],
      select: { slug: true, name: true, emoji: true },
    }),
    db.product.findMany({
      where: { active: true, brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
  ]);

  const ratings = rows.length
    ? await db.review.groupBy({
        by: ["productId"],
        where: { productId: { in: rows.map((r) => r.id) } },
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

  const products = rows.map((p) => ({
    id: p.id,
    name: p.name,
    priceSatang: p.priceSatang,
    imageJson: p.imageJson,
    stock: p.stock,
    vendor: p.vendor,
    avgRating: ratingMap.get(p.id)?.avgRating ?? 0,
    reviewCount: ratingMap.get(p.id)?.reviewCount ?? 0,
  }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const brands = brandRows.map((b) => b.brand).filter((b): b is string => Boolean(b));

  const vendorShopName = vendorId
    ? (await db.vendor.findUnique({ where: { id: vendorId }, select: { shopName: true } }))
        ?.shopName
    : undefined;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-3 py-6 sm:px-6 sm:py-10">
      <div>
        <h1 className="text-xl font-bold text-ink sm:text-2xl">
          {vendorShopName
            ? `🏪 ${vendorShopName}`
            : q
              ? `ผลการค้นหา "${q}"`
              : "สินค้าทั้งหมด"}
        </h1>
        <p className="text-sm text-muted">พบ {total.toLocaleString("th-TH")} รายการ</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <FiltersBar
          categories={categories}
          brands={brands}
          initial={{ q, category, brand, minPrice: sp.minPrice, maxPrice: sp.maxPrice, sort }}
        />

        <div className="flex flex-col gap-5">
          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5 sm:p-16">
              <span className="text-6xl" aria-hidden>
                🔍
              </span>
              <p className="text-base font-bold text-ink">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
              <p className="text-sm text-muted">ลองปรับตัวกรองหรือคำค้นหาใหม่อีกครั้ง</p>
              <Link
                href="/products"
                className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark"
              >
                ล้างตัวกรองทั้งหมด
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            searchParams={{
              q,
              category,
              brand,
              minPrice: sp.minPrice,
              maxPrice: sp.maxPrice,
              sort,
              vendorId,
            }}
          />
        </div>
      </div>
    </div>
  );
}
