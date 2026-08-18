import { Prisma } from "@prisma/client";
import { handler, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { int, parseImage, str } from "../_lib/http";

const PAGE_SIZE = 12;

export const GET = handler(async (req: Request) => {
  const sp = new URL(req.url).searchParams;
  const category = str(sp.get("category"));
  const q = str(sp.get("q"));
  const brand = str(sp.get("brand"));
  const vendorId = str(sp.get("vendorId"));
  const sort = str(sp.get("sort")) ?? "new";
  const page = Math.max(1, int(sp.get("page"), 1) ?? 1);
  const pageSize = Math.min(60, Math.max(1, int(sp.get("pageSize"), PAGE_SIZE) ?? PAGE_SIZE));

  const where: Prisma.ProductWhereInput = { active: true };
  if (category)
    where.category = { OR: [{ slug: category }, { id: category }] };
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

  let orderBy: Prisma.ProductOrderByWithRelationInput[];
  switch (sort) {
    case "price_asc":
    case "price-asc":
      orderBy = [{ priceSatang: "asc" }];
      break;
    case "price_desc":
    case "price-desc":
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

  const [total, rows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        vendor: { select: { id: true, shopName: true, logoEmoji: true } },
        category: { select: { id: true, name: true, slug: true, emoji: true } },
      },
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
    sku: p.sku,
    partCode: p.partCode,
    brand: p.brand,
    description: p.description,
    priceSatang: p.priceSatang,
    stock: p.stock,
    image: parseImage(p.imageJson),
    vendor: p.vendor,
    category: p.category,
    avgRating: ratingMap.get(p.id)?.avgRating ?? 0,
    reviewCount: ratingMap.get(p.id)?.reviewCount ?? 0,
    createdAt: p.createdAt,
  }));

  return ok({ products, total, page, pageSize });
});
