import Link from "next/link";
import { formatBaht } from "@/lib/money";
import { parseProductImage } from "./image";
import { ProductImage } from "./product-image";
import { QuickAddButton } from "./quick-add-button";
import { StarRating } from "./star-rating";

export type ProductCardData = {
  id: string;
  name: string;
  priceSatang: number;
  imageJson: string;
  avgRating: number;
  reviewCount: number;
  stock: number;
  vendor: { id: string; shopName: string };
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const img = parseProductImage(product.imageJson);
  const lowStock = product.stock > 0 && product.stock < 10;
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="relative">
        <ProductImage image={img} size="md" rounded="rounded-none" />

        {(lowStock || outOfStock) && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-bold shadow-sm ${
              outOfStock ? "bg-muted text-white" : "bg-accent text-white"
            }`}
          >
            {outOfStock ? "สินค้าหมด" : "สต็อกน้อย"}
          </span>
        )}

        <QuickAddButton
          productId={product.id}
          name={product.name}
          priceSatang={product.priceSatang}
          stock={product.stock}
          vendorId={product.vendor.id}
          vendorName={product.vendor.shopName}
          image={img}
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <p className="line-clamp-2 min-h-[2.5em] text-sm font-semibold text-ink transition-colors group-hover:text-primary sm:text-base">
          {product.name}
        </p>
        <span className="w-fit truncate rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
          🏪 {product.vendor.shopName}
        </span>
        <StarRating rating={product.avgRating} reviewCount={product.reviewCount} />
        <p className="mt-auto pt-1 text-base font-extrabold text-primary-dark sm:text-lg">
          {formatBaht(product.priceSatang)}
        </p>
      </div>
    </Link>
  );
}
