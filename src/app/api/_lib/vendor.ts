import { AuthError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Vendor } from "@prisma/client";

/**
 * คืนร้านค้าของผู้ใช้ที่ล็อกอินอยู่
 * ADMIN สามารถระบุ ?vendorId= เพื่อดูแทนร้านได้ (ใช้ตอนดูข้อมูลจากหลังบ้าน)
 */
export async function requireVendor(req?: Request): Promise<Vendor> {
  const user = await requireUser("VENDOR");
  if (user.vendor) return user.vendor;

  if (user.role === "ADMIN" && req) {
    const vendorId = new URL(req.url).searchParams.get("vendorId");
    if (vendorId) {
      const v = await db.vendor.findUnique({ where: { id: vendorId } });
      if (v) return v;
    }
  }
  throw new AuthError(403, "บัญชีนี้ยังไม่ได้ผูกกับร้านค้า");
}
