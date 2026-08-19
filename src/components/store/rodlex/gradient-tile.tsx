import type { CSSProperties } from "react";
import type { TileImage } from "./image";

const EMOJI_SIZE = {
  xs: "text-lg",
  sm: "text-2xl",
  md: "text-4xl sm:text-5xl",
  lg: "text-6xl sm:text-7xl",
} as const;

/**
 * กระเบื้องภาพ gradient+emoji ใช้แทนภาพจริงทุกจุดของหน้า Rodlex ใหม่
 * (แนวเดียวกับ ProductImage — พื้นไล่สี + emoji กลาง แทนรูปถ่าย)
 */
export function GradientTile({
  image,
  size = "md",
  rounded = "rounded-2xl",
  className = "",
  style,
}: {
  image: TileImage;
  size?: keyof typeof EMOJI_SIZE;
  rounded?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center overflow-hidden ${rounded} ${className}`}
      style={{ background: `linear-gradient(135deg, ${image.from}, ${image.to})`, ...style }}
    >
      <span className={EMOJI_SIZE[size]}>{image.emoji}</span>
    </div>
  );
}
