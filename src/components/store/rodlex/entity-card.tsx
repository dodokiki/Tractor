import Link from "next/link";
import type { ReactNode } from "react";
import type { TileImage } from "./image";
import { GradientTile } from "./gradient-tile";

/** การ์ดกริด 4 ต่อแถว ใช้ทั้งช่างและร้านอะไหล่ (ภาพ, ชื่อ, บรรทัดเมตาด้านล่าง, ชิปหมวดมุมภาพ) */
export function EntityCard({
  href,
  image,
  title,
  meta,
  chip,
}: {
  href: string;
  image: TileImage;
  title: string;
  meta: ReactNode;
  chip?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7A43] focus-visible:ring-offset-2"
    >
      <div className="relative">
        <GradientTile image={image} size="lg" rounded="rounded-none" className="aspect-[4/3] w-full" />
        {chip && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#1B7A43] shadow-sm backdrop-blur">
            {chip}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3 sm:p-4">
        <p className="line-clamp-1 text-sm font-bold text-ink transition-colors group-hover:text-[#1B7A43] sm:text-base">
          {title}
        </p>
        <div className="text-xs text-muted sm:text-sm">{meta}</div>
      </div>
    </Link>
  );
}
