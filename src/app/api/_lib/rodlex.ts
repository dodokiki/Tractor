// Helper สำหรับ API กลุ่ม Rodlex (ทีมช่าง / ข่าว / กระทู้ / งาน / เรียกช่าง)
// อยู่ในโฟลเดอร์ _lib = private folder ของ Next.js จึงไม่กลายเป็น route
import { db } from "@/lib/db";
import type { Technician } from "@prisma/client";
import type { ProductImage } from "./http";

const FALLBACK: ProductImage = { emoji: "🛠️", from: "#1B7A43", to: "#2FA55C" };

/** normalize object รูปแบบ {emoji,from,to} (ใช้ทั้งตอนอ่านและตอนรับ input) */
export function toImage(v: unknown, fallback: ProductImage = FALLBACK): ProductImage {
  if (!v || typeof v !== "object") return { ...fallback };
  const o = v as Partial<ProductImage>;
  return {
    emoji: typeof o.emoji === "string" && o.emoji.trim() ? o.emoji.trim() : fallback.emoji,
    from: typeof o.from === "string" && o.from.trim() ? o.from.trim() : fallback.from,
    to: typeof o.to === "string" && o.to.trim() ? o.to.trim() : fallback.to,
  };
}

/** imageJson (string) → {emoji,from,to} */
export function readImage(json: string | null | undefined, fallback?: ProductImage): ProductImage {
  if (!json) return { ...(fallback ?? FALLBACK) };
  try {
    return toImage(JSON.parse(json), fallback ?? FALLBACK);
  } catch {
    return { ...(fallback ?? FALLBACK) };
  }
}

/** imagesJson (string ของ array) → [{emoji,from,to}] สูงสุด 4 รูป */
export function readImages(json: string | null | undefined): ProductImage[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    if (!Array.isArray(v)) return [];
    return v.slice(0, 4).map((x) => toImage(x));
  } catch {
    return [];
  }
}

/** array ของรูปจาก body → JSON string (สูงสุด 4 รูป) หรือ null ถ้าไม่ส่งมา */
export function writeImages(v: unknown): string | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  return JSON.stringify(v.slice(0, 4).map((x) => toImage(x)));
}

/** "ไฮดรอลิก, เครื่องยนต์" → ["ไฮดรอลิก","เครื่องยนต์"] */
export function splitList(v: string | null | undefined): string[] {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** array | "a,b" → "a,b" (เก็บลงคอลัมน์ String) */
export function joinList(v: unknown): string | null {
  if (Array.isArray(v)) {
    const items = v.map((x) => String(x).trim()).filter(Boolean);
    return items.length ? items.join(",") : null;
  }
  if (typeof v === "string") {
    const s = v.trim();
    return s.length ? s : null;
  }
  return null;
}

/** ตัดเนื้อหายาวให้เหลือย่อหน้าแรกแบบสั้น สำหรับการ์ดในฟีด */
export function excerptOf(body: string, max = 180): string {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max).trimEnd()}…`;
}

/** ตัวช่วยตรวจค่า enum จาก query/body (คืน undefined ถ้าไม่ตรง) */
function enumOf<T extends string>(values: readonly T[]) {
  return (v: unknown): T | undefined => {
    if (typeof v !== "string") return undefined;
    const up = v.trim().toUpperCase() as T;
    return values.includes(up) ? up : undefined;
  };
}

export const MACHINE_CATEGORIES = ["CONSTRUCTION", "AGRICULTURE", "MODIFICATION"] as const;
export const NEWS_GROUPS = ["CONSTRUCTION", "AGRICULTURE", "PLATFORM"] as const;
export const FORUM_CATEGORIES = ["REPAIR", "PARTS", "MODIFICATION", "TECH_ZONE"] as const;
export const JOB_TYPES = ["TECHNICIAN_FREELANCE", "SHOP_PARTNER", "STAFF"] as const;
export const SERVICE_STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;

export const machineCategory = enumOf(MACHINE_CATEGORIES);
export const newsGroup = enumOf(NEWS_GROUPS);
export const forumCategory = enumOf(FORUM_CATEGORIES);
export const jobType = enumOf(JOB_TYPES);
export const serviceStatus = enumOf(SERVICE_STATUSES);

/** ผู้เขียนกระทู้/ตอบกลับเก็บเป็น authorId ธรรมดา (ไม่มี relation) — ดึงชื่อเป็นชุดเดียว */
export type AuthorRef = { id: string; name: string };

export async function authorMap(ids: string[]): Promise<Map<string, AuthorRef>> {
  const uniq = [...new Set(ids.filter(Boolean))];
  if (!uniq.length) return new Map();
  const users = await db.user.findMany({
    where: { id: { in: uniq } },
    select: { id: true, name: true },
  });
  return new Map(users.map((u) => [u.id, { id: u.id, name: u.name }]));
}

export const UNKNOWN_AUTHOR: AuthorRef = { id: "", name: "ผู้ใช้ Rodlex" };

const TECH_IMAGE: ProductImage = { emoji: "🧑‍🔧", from: "#1B7A43", to: "#2FA55C" };

/** Technician row → รูปแบบการ์ดที่ UI ใช้ */
export function technicianCard(t: Technician) {
  return {
    id: t.id,
    code: t.code,
    name: t.name,
    bio: t.bio,
    skills: splitList(t.skills),
    category: t.category,
    province: t.province,
    online: t.online,
    jobsDone: t.jobsDone,
    rating: t.rating,
    reviewCount: t.reviewCount,
    featured: t.featured,
    image: readImage(t.imageJson, TECH_IMAGE),
    createdAt: t.createdAt,
  };
}

/** page → skip/take มาตรฐาน */
export function paging(pageRaw: number | undefined, size: number) {
  const page = Math.max(1, pageRaw ?? 1);
  return { page, pageSize: size, skip: (page - 1) * size, take: size };
}
