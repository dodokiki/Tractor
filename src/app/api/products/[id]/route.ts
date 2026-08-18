import { handler, ok, fail } from "@/lib/api";
import { db } from "@/lib/db";
import { parseImage } from "../../_lib/http";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const p = await db.product.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            shopName: true,
            logoEmoji: true,
            description: true,
          },
        },
        category: { select: { id: true, name: true, slug: true, emoji: true } },
        compatibility: { include: { tractorModel: true } },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });
    if (!p) return fail("ไม่พบสินค้านี้", 404);

    const agg = await db.review.aggregate({
      where: { productId: p.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return ok({
      product: {
        id: p.id,
        name: p.name,
        sku: p.sku,
        partCode: p.partCode,
        brand: p.brand,
        description: p.description,
        priceSatang: p.priceSatang,
        stock: p.stock,
        active: p.active,
        image: parseImage(p.imageJson),
        vendor: p.vendor,
        category: p.category,
        createdAt: p.createdAt,
        avgRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
        reviewCount: agg._count.rating,
        compatibility: p.compatibility.map((c) => ({
          brand: c.tractorModel.brand,
          model: c.tractorModel.model,
        })),
        reviews: p.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          userName: r.user.name,
        })),
      },
    });
  },
);
