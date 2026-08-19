// Utility ภาพ gradient+emoji สำหรับหน้าใหม่ของ Rodlex (ทีมช่าง/ร้านอะไหล่/กระทู้)
// แนวเดียวกับ src/components/store/image.ts (ProductImage) แต่แยกชุดเพื่อไม่ผูกกับสินค้า

export type TileImage = { emoji: string; from: string; to: string };

export const DEFAULT_TILE: TileImage = { emoji: "🧑‍🔧", from: "#1B7A43", to: "#2FA55C" };

export function parseTileImage(
  json: string | null | undefined,
  fallback: TileImage = DEFAULT_TILE,
): TileImage {
  if (!json) return fallback;
  try {
    const v = JSON.parse(json) as Partial<TileImage>;
    return {
      emoji: typeof v.emoji === "string" && v.emoji ? v.emoji : fallback.emoji,
      from: typeof v.from === "string" && v.from ? v.from : fallback.from,
      to: typeof v.to === "string" && v.to ? v.to : fallback.to,
    };
  } catch {
    return fallback;
  }
}

/** parse ภาพประกอบกระทู้ (ForumThread.imagesJson) — คืน array ว่างถ้าไม่มี/parse ไม่ได้ */
export function parseTileImages(json: string | null | undefined): TileImage[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((v): v is Partial<TileImage> => !!v && typeof v === "object")
      .map((v) => parseTileImage(JSON.stringify(v)))
      .slice(0, 4);
  } catch {
    return [];
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const int = parseInt(full || "1b7a43", 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

/** ผสมสีกับขาวเพื่อทำเฉดอ่อนลง (ใช้ทำ gradient จากสีเดียวของร้านค้า) */
export function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/** ร้านค้า (Vendor) เก็บแค่ logoEmoji + themeColor (hex ไม่มี #) — แปลงเป็น TileImage */
export function vendorTileImage(logoEmoji: string, themeColor: string): TileImage {
  const from = themeColor.startsWith("#") ? themeColor : `#${themeColor}`;
  return { emoji: logoEmoji || "🏪", from, to: lighten(from, 0.55) };
}
