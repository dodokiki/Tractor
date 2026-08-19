import { GradientTile } from "../gradient-tile";
import type { TileImage } from "../image";

/**
 * แกลเลอรีภาพประกอบกระทู้ — สลับ layout ตามจำนวนรูป (0/1/2/3-4)
 * (ใช้แค่จัดกลุ่มตัวภาพ ไม่รวมข้อความ — คนเรียกเป็นคนตัดสินใจจัด row/col กับข้อความ)
 */
export function ThreadGallery({ images }: { images: TileImage[] }) {
  const n = images.length;
  if (n === 0) return null;

  if (n === 1) {
    return (
      <GradientTile
        image={images[0]}
        size="lg"
        className="aspect-square w-32 shrink-0 sm:w-44"
      />
    );
  }

  if (n === 2) {
    return (
      <div className="flex shrink-0 gap-2">
        {images.map((img, i) => (
          <GradientTile key={i} image={img} size="md" className="aspect-square w-28 sm:w-36" />
        ))}
      </div>
    );
  }

  const colsClass = n === 3 ? "grid-cols-3" : "grid-cols-4";
  return (
    <div className={`grid gap-2 ${colsClass}`}>
      {images.slice(0, 4).map((img, i) => (
        <GradientTile key={i} image={img} size="md" className="aspect-square w-full" />
      ))}
    </div>
  );
}

/** จำนวนรูป 1-2 = จัดแถวคู่กับข้อความ (แนวนอน), 0/3-4 = เต็มแถวแล้วข้อความอยู่ด้านล่าง */
export function isRowLayout(n: number) {
  return n === 1 || n === 2;
}
