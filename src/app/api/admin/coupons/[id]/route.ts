import type { Prisma } from "@prisma/client";
import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, bool, int, readBody, str } from "../../../_lib/http";

export const PATCH = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const admin = await requireUser("ADMIN");
    const { id } = await ctx.params;
    const coupon = await db.coupon.findUnique({ where: { id } });
    if (!coupon) return fail("ไม่พบคูปองนี้", 404);

    const b = await readBody<Record<string, unknown>>(req);
    const data: Prisma.CouponUpdateInput = {};
    const type = str(b.type)?.toUpperCase();
    if (type) {
      if (type !== "PERCENT" && type !== "FIXED")
        return fail("ประเภทคูปองต้องเป็น PERCENT หรือ FIXED");
      data.type = type;
    }
    const value = int(b.value);
    if (value !== undefined) {
      if (value <= 0) return fail("มูลค่าคูปองไม่ถูกต้อง");
      data.value = value;
    }
    const minTotalSatang = int(b.minTotalSatang);
    if (minTotalSatang !== undefined) {
      if (minTotalSatang < 0) return fail("ยอดขั้นต่ำไม่ถูกต้อง");
      data.minTotalSatang = minTotalSatang;
    }
    const active = bool(b.active);
    if (active !== undefined) data.active = active;
    if (b.expiresAt !== undefined) {
      const raw = str(b.expiresAt);
      if (!raw) data.expiresAt = null;
      else {
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return fail("วันหมดอายุไม่ถูกต้อง");
        data.expiresAt = d;
      }
    }

    const updated = await db.coupon.update({ where: { id }, data });
    await audit(db, {
      userId: admin.id,
      action: "COUPON_UPDATE",
      entity: "Coupon",
      entityId: id,
      detail: { fields: Object.keys(data) },
    });
    return ok({ coupon: updated });
  },
);

export const DELETE = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const admin = await requireUser("ADMIN");
    const { id } = await ctx.params;
    const coupon = await db.coupon.findUnique({ where: { id } });
    if (!coupon) return fail("ไม่พบคูปองนี้", 404);
    await db.coupon.update({ where: { id }, data: { active: false } });
    await audit(db, {
      userId: admin.id,
      action: "COUPON_DEACTIVATE",
      entity: "Coupon",
      entityId: id,
    });
    return ok({ deactivated: true });
  },
);
