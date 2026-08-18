import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, int, readBody, str } from "../../_lib/http";

export const GET = handler(async () => {
  await requireUser("ADMIN");
  const coupons = await db.coupon.findMany({ orderBy: { code: "asc" } });
  return ok({ coupons });
});

export const POST = handler(async (req: Request) => {
  const admin = await requireUser("ADMIN");
  const b = await readBody<Record<string, unknown>>(req);
  const code = str(b.code)?.toUpperCase();
  const type = str(b.type)?.toUpperCase();
  const value = int(b.value);
  if (!code) return fail("กรุณากรอกรหัสคูปอง");
  if (type !== "PERCENT" && type !== "FIXED")
    return fail("ประเภทคูปองต้องเป็น PERCENT หรือ FIXED");
  if (value === undefined || value <= 0) return fail("มูลค่าคูปองไม่ถูกต้อง");
  if (type === "PERCENT" && value > 100)
    return fail("ส่วนลดเปอร์เซ็นต์ต้องไม่เกิน 100");
  if (await db.coupon.findUnique({ where: { code } }))
    return fail("รหัสคูปองนี้ถูกใช้แล้ว");

  const expiresRaw = str(b.expiresAt);
  const expiresAt = expiresRaw ? new Date(expiresRaw) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime()))
    return fail("วันหมดอายุไม่ถูกต้อง");

  const coupon = await db.coupon.create({
    data: {
      code,
      type,
      value,
      minTotalSatang: int(b.minTotalSatang, 0) ?? 0,
      active: b.active === undefined ? true : b.active === true,
      expiresAt,
    },
  });
  await audit(db, {
    userId: admin.id,
    action: "COUPON_CREATE",
    entity: "Coupon",
    entityId: coupon.id,
    detail: { code, type, value },
  });
  return ok({ coupon }, { status: 201 });
});
