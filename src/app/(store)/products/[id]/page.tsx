import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatBaht } from "@/lib/money";
import { parseProductImage } from "@/components/store/image";
import { ProductImage } from "@/components/store/product-image";
import { StarRating } from "@/components/store/star-rating";
import { AddToCartBox } from "@/components/store/add-to-cart-box";

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

const AVATAR_COLORS = ["#1B7A43", "#2FA55C", "#F5862B", "#14351F", "#6C7A70"];

function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

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
  const lowStock = product.stock > 0 && product.stock < 10;
  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-3 py-6 sm:px-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="breadcrumb">
        <Link href="/" className="hover:text-primary hover:underline">
          หน้าแรก
        </Link>
        <span aria-hidden>/</span>
        <Link href="/products" className="hover:text-primary hover:underline">
          สินค้าทั้งหมด
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/products?category=${encodeURIComponent(product.category.slug)}`}
          className="hover:text-primary hover:underline"
        >
          {product.category.emoji} {product.category.name}
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-10 lg:items-start">
        <div>
          <ProductImage image={img} size="lg" rounded="rounded-3xl" className="shadow-sm ring-1 ring-black/5" />
          {(lowStock || outOfStock) && (
            <span
              className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                outOfStock ? "bg-muted/15 text-muted" : "bg-accent/15 text-accent-dark"
              }`}
            >
              {outOfStock ? "สินค้าหมดชั่วคราว" : `เหลือเพียง ${product.stock} ชิ้น`}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-muted">
            {product.category.emoji} {product.category.name}
            {product.brand ? ` · ยี่ห้อ ${product.brand}` : ""}
          </p>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">{product.name}</h1>
          <StarRating rating={avgRating} reviewCount={reviewCount} size="md" />
          <p className="text-3xl font-extrabold text-primary-dark">
            {formatBaht(product.priceSatang)}
          </p>

          <Link
            href={`/products?vendorId=${product.vendor.id}`}
            className="flex items-center gap-2.5 rounded-xl bg-white p-3 text-sm shadow-sm ring-1 ring-black/5 transition hover:ring-primary/30"
          >
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-xl"
            >
              {product.vendor.logoEmoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{product.vendor.shopName}</p>
              <p className="text-xs text-muted">ร้านค้าพาร์ทเนอร์ Rodlex</p>
            </div>
            <span className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-primary">
              ดูร้าน →
            </span>
          </Link>

          {product.partCode && (
            <p className="text-xs text-muted">รหัสอะไหล่: {product.partCode}</p>
          )}
          <p className="text-xs text-muted">SKU: {product.sku}</p>

          <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:sticky sm:top-24">
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
          <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
            {product.compatibility.map((c) => (
              <span
                key={`${c.tractorModel.brand}-${c.tractorModel.model}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-ink ring-1 ring-line"
              >
                <span className="text-primary">{c.tractorModel.brand}</span>
                {c.tractorModel.model}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">
          รีวิวจากลูกค้า {reviewCount > 0 ? `(${reviewCount})` : ""}
        </h2>
        {product.reviews.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-sm text-muted shadow-sm ring-1 ring-black/5">
            ยังไม่มีรีวิวสำหรับสินค้านี้
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {product.reviews.map((r) => (
              <div
                key={r.id}
                className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
              >
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: avatarColor(r.user.name) }}
                >
                  {initialOf(r.user.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{r.user.name}</p>
                    <StarRating rating={r.rating} />
                  </div>
                  {r.comment && <p className="mt-1 text-sm text-muted">{r.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
