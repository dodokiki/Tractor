import type { ForumCategory } from "@prisma/client";
import type { TileImage } from "../image";

export const FORUM_CATEGORY_LABEL: Record<ForumCategory, string> = {
  REPAIR: "ปัญหาและการซ่อมแซม",
  PARTS: "อะไหล่และวัสดุสิ้นเปลือง",
  MODIFICATION: "เทคนิคและการดัดแปลง",
  TECH_ZONE: "พื้นที่ช่างรถเหล็ก",
};

export const FORUM_TABS: { label: string; value?: string }[] = [
  { label: "สำหรับคุณ", value: undefined },
  { label: "ปัญหาและการซ่อมแซม", value: "REPAIR" },
  { label: "อะไหล่และวัสดุสิ้นเปลือง", value: "PARTS" },
  { label: "เทคนิคและการดัดแปลง", value: "MODIFICATION" },
  { label: "พื้นที่ช่างรถเหล็ก", value: "TECH_ZONE" },
];

/** ตัวเลือกภาพประกอบ emoji ให้ผู้ตั้งกระทู้เลือกได้สูงสุด 4 รูป */
export const FORUM_IMAGE_PALETTE: (TileImage & { label: string })[] = [
  { emoji: "🔧", from: "#1B7A43", to: "#2FA55C", label: "งานซ่อม" },
  { emoji: "🚜", from: "#F5862B", to: "#FBBF77", label: "แทรกเตอร์" },
  { emoji: "🏗️", from: "#4F46E5", to: "#8B85F0", label: "ก่อสร้าง" },
  { emoji: "⚙️", from: "#334155", to: "#64748B", label: "อะไหล่" },
  { emoji: "🌾", from: "#65A30D", to: "#A3E635", label: "เกษตร" },
  { emoji: "🚧", from: "#D97706", to: "#FCD34D", label: "หน้างาน" },
  { emoji: "🧑‍🔧", from: "#0EA5E9", to: "#7DD3FC", label: "ช่าง" },
  { emoji: "🛠️", from: "#DC2626", to: "#FCA5A5", label: "เครื่องมือ" },
];
