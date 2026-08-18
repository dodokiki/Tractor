import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatBaht } from "@/lib/money";
import { gradientStyle, parseProductImage } from "@/components/store/image";
import { StarRating } from "@/components/store/star-rating";
import { AddToCartBox } from "@/components/store/add-to-cart-box";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: {
      vendor: { select: { id: true, shopName: true, logoEmoji: true, description: true } },
      category: { select: { id: true, name: true, slug: true, emoji: true } },
      compatibility: { include: { tractorModel: true } },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!product || !product.active) notFound();

  const agg = await db.review.aggregate({
    where: { productId: product.id },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const avgRating = agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0;
  const reviewCount = agg._count.rating;

  const img = parseProductImage(product.imageJson);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-3 py-6 sm:px-6 sm:py-10">
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-10">
        <div
          className="flex aspect-square items-center justify-center rounded-2xl text-[8rem] shadow-sm sm:text-[10rem]"
          style={gradientStyle(img)}
        >
          <span aria-hidden>{img.emoji}</span>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-muted">
            {product.category.emoji} {product.category.name}
            {product.brand ? ` · ยี่ห้อ ${product.brand}` : ""}
          </p>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">{product.name}</h1>
          <StarRating rating={avgRating} reviewCount={reviewCount} size="md" />
          <p className="text-3xl font-extrabold text-primary">
            {formatBaht(product.priceSatang)}
          </p>

          <div className="flex items-center gap-2 rounded-xl bg-white p-3 text-sm shadow-sm ring-1 ring-black/5">
            <span aria-hidden className="text-xl">
              {product.vendor.logoEmoji}
            </span>
            <div>
              <p className="font-semibold text-ink">{product.vendor.shopName}</p>
              <p className="text-xs text-muted">ร้านค้าพาร์ทเนอร์ TractorHub</p>
            </div>
          </div>

          {product.partCode && (
            <p className="text-xs text-muted">รหัสอะไหล่: {product.partCode}</p>
          )}
          <p className="text-xs text-muted">SKU: {product.sku}</p>

          <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <AddToCartBox
              productId={product.id}
              name={product.name}
              priceSatang={product.priceSatang}
              stock={product.stock}
              vendorId={product.vendor.id}
              vendorName={product.vendor.shopName}
              image={img}
            />
          </div>

          {product.description && (
            <div>
              <h2 className="mb-1 text-sm font-bold text-ink">รายละเอียดสินค้า</h2>
              <p className="whitespace-pre-line text-sm text-muted">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {product.compatibility.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-ink">ความเข้ากันได้กับรุ่นรถ</h2>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs font-semibold uppercase text-muted">
                <tr>
                  <th className="px-4 py-2.5">ยี่ห้อรถ</th>
                  <th className="px-4 py-2.5">รุ่น</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {product.compatibility.map((c) => (
                  <tr key={`${c.tractorModel.brand}-${c.tractorModel.model}`}>
                    <td className="px-4 py-2.5 text-ink">{c.tractorModel.brand}</td>
                    <td className="px-4 py-2.5 text-ink">{c.tractorModel.model}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">
          รีวิวจากลูกค้า {reviewCount > 0 ? `(${reviewCount})` : ""}
        </h2>
        {product.reviews.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-sm text-muted shadow-sm">
            ยังไม่มีรีวิวสำหรับสินค้านี้
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {product.reviews.map((r) => (
              <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">{r.user.name}</p>
                  <StarRating rating={r.rating} />
                </div>
                {r.comment && <p className="mt-1 text-sm text-muted">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
