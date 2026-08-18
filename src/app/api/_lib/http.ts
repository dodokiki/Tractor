// Helper ภายในของชั้น API เท่านั้น (โฟลเดอร์ _lib = private folder ของ Next.js ไม่กลายเป็น route)
import { Prisma } from "@prisma/client";

export type DbLike = Prisma.TransactionClient;

/** อ่าน JSON body แบบไม่โยน error ถ้า body ว่าง/ผิดรูป */
export async function readBody<T = Record<string, unknown>>(
  req: Request,
): Promise<T> {
  try {
    return ((await req.json()) ?? {}) as T;
  } catch {
    return {} as T;
  }
}

export function str(v: unknown): string | undefined {
  if (typeof v === "string") {
    const s = v.trim();
    return s.length ? s : undefined;
  }
  if (typeof v === "number") return String(v);
  return undefined;
}

export function int(v: unknown, fallback?: number): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return fallback;
}

export function bool(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return undefined;
}

export type ProductImage = { emoji: string; from: string; to: string };

const DEFAULT_IMAGE: ProductImage = {
  emoji: "🔩",
  from: "#1B7A43",
  to: "#2FA55C",
};

/** แปลง Product.imageJson → {emoji, from, to} สำหรับการ์ด gradient */
export function parseImage(imageJson: string | null | undefined): ProductImage {
  if (!imageJson) return { ...DEFAULT_IMAGE };
  try {
    const v = JSON.parse(imageJson) as Partial<ProductImage>;
    return {
      emoji: typeof v.emoji === "string" ? v.emoji : DEFAULT_IMAGE.emoji,
      from: typeof v.from === "string" ? v.from : DEFAULT_IMAGE.from,
      to: typeof v.to === "string" ? v.to : DEFAULT_IMAGE.to,
    };
  } catch {
    return { ...DEFAULT_IMAGE };
  }
}

/** แปลง Order.addressJson → object (กัน JSON เสีย) */
export function parseAddress(addressJson: string | null | undefined) {
  if (!addressJson) return null;
  try {
    return JSON.parse(addressJson) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** บันทึก AuditLog ของ action สำคัญ — ใช้ได้ทั้งกับ db และ transaction client */
export async function audit(
  client: DbLike,
  data: {
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    detail?: unknown;
  },
) {
  await client.auditLog.create({
    data: {
      userId: data.userId ?? null,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId ?? null,
      detailJson:
        data.detail === undefined ? null : JSON.stringify(data.detail),
    },
  });
}

export const BANK_INFO = {
  bank: "ธนาคารกสิกรไทย",
  accountNo: "123-4-56789-0",
  accountName: "บจก. แทรกเตอร์ฮับ",
};

/** ค่าจัดส่งเหมาต่อคำสั่งซื้อ = ฿50 */
export const SHIPPING_SATANG = 5000;
