"use client";

import type { CSSProperties } from "react";
import { gradientStyle, type ProductImage as ProductImageData } from "./image";

const SIZE_CLASS = {
  xs: "text-2xl",
  sm: "text-3xl",
  md: "text-5xl sm:text-6xl",
  lg: "text-[6rem] sm:text-[8rem]",
} as const;

const IMG_PADDING = {
  xs: "p-1.5",
  sm: "p-2",
  md: "p-6 sm:p-8",
  lg: "p-10 sm:p-14",
} as const;

/**
 * การ์ดภาพสินค้าที่ใช้ซ้ำได้ทุกที่ (การ์ดสินค้า, หน้ารายละเอียด, ตะกร้า, รายการออเดอร์)
 * ถ้า image.img มีไฟล์ SVG ให้แสดง <img> วางกลางพื้น gradient พาสเทล
 * ถ้าไม่มีให้ fallback เป็น emoji ใหญ่กลางพื้นเดิม
 */
export function ProductImage({
  image,
  size = "md",
  rounded = "rounded-2xl",
  className = "",
  style,
}: {
  image: ProductImageData;
  size?: keyof typeof SIZE_CLASS;
  rounded?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`flex aspect-square items-center justify-center overflow-hidden ${rounded} ${className}`}
      style={{ ...gradientStyle(image), ...style }}
    >
      {image.img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.img}
          alt=""
          aria-hidden
          className={`h-full w-full object-contain ${IMG_PADDING[size]} transition-transform duration-300 group-hover:scale-105`}
          onError={(e) => {
            // ถ้าไฟล์ภาพยังไม่มี ให้ซ่อนแล้วปล่อยให้ emoji ข้าง ๆ ทำหน้าที่แทน
            (e.currentTarget as HTMLImageElement).style.display = "none";
            const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (sibling) sibling.style.display = "flex";
          }}
        />
      ) : null}
      <span
        aria-hidden
        className={`${SIZE_CLASS[size]} ${image.img ? "hidden" : "flex"} items-center justify-center`}
      >
        {image.emoji}
      </span>
    </div>
  );
}
