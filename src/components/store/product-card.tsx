import Link from "next/link";
import { formatBaht } from "@/lib/money";
import { gradientStyle, parseProductImage } from "./image";
import { StarRating } from "./star-rating";

export type ProductCardData = {
  id: string;
  name: string;
  priceSatang: number;
  imageJson: string;
  avgRating: number;
  reviewCount: number;
  vendor: { shopName: string };
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const img = parseProductImage(product.imageJson);
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className="flex aspect-square items-center justify-center text-5xl sm:text-6xl"
        style={gradientStyle(img)}
      >
        <span aria-hidden>{img.emoji}</span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <p className="line-clamp-2 min-h-[2.5em] text-sm font-semibold text-ink group-hover:text-primary sm:text-base">
          {product.name}
        </p>
        <p className="truncate text-xs text-muted">{product.vendor.shopName}</p>
        <StarRating rating={product.avgRating} reviewCount={product.reviewCount} />
        <p className="mt-auto pt-1 text-base font-bold text-primary sm:text-lg">
          {formatBaht(product.priceSatang)}
        </p>
      </div>
    </Link>
  );
}
