// Utility เดียวกับฝั่ง API สำหรับแปลง Product.imageJson → {emoji, from, to}
// (เก็บสำเนาไว้ในเขต storefront เพื่อไม่ผูกกับ src/app/api/_lib ที่เป็นเขตของทีม backend)
import type { CSSProperties } from "react";

export type ProductImage = { emoji: string; from: string; to: string };

const DEFAULT_IMAGE: ProductImage = {
  emoji: "🔩",
  from: "#1B7A43",
  to: "#2FA55C",
};

export function parseProductImage(imageJson: string | null | undefined): ProductImage {
  if (!imageJson) return DEFAULT_IMAGE;
  try {
    const parsed = JSON.parse(imageJson) as Partial<ProductImage>;
    return {
      emoji: parsed.emoji ?? DEFAULT_IMAGE.emoji,
      from: parsed.from ?? DEFAULT_IMAGE.from,
      to: parsed.to ?? DEFAULT_IMAGE.to,
    };
  } catch {
    return DEFAULT_IMAGE;
  }
}

export function gradientStyle(img: ProductImage): CSSProperties {
  return { background: `linear-gradient(135deg, ${img.from}, ${img.to})` };
}
