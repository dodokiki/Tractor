import type { Prisma } from "@prisma/client";
import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, bool, int, readBody, str } from "../../../_lib/http";

export const PATCH = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const admin = await requireUser("ADMIN");
    const { id } = await ctx.params;
    const vendor = await db.vendor.findUnique({ where: { id } });
    if (!vendor) return fail("ไม่พบร้านค้านี้", 404);

    const b = await readBody<Record<string, unknown>>(req);
    const data: Prisma.VendorUpdateInput = {};
    const shopName = str(b.shopName);
    if (shopName) data.shopName = shopName;
    if (b.description !== undefined)
      data.description = str(b.description) ?? null;
    const logoEmoji = str(b.logoEmoji);
    if (logoEmoji) data.logoEmoji = logoEmoji;
    const themeColor = str(b.themeColor);
    if (themeColor) data.themeColor = themeColor;
    const commissionBps = int(b.commissionBps);
    if (commissionBps !== undefined) {
      if (commissionBps < 0 || commissionBps > 5000)
        return fail("ค่าคอมมิชชันต้องอยู่ระหว่าง 0–50%");
      data.commissionBps = commissionBps;
    }
    const approved = bool(b.approved);
    if (approved !== undefined) data.approved = approved;

    const updated = await db.$transaction(async (tx) => {
      const v = await tx.vendor.update({ where: { id }, data });
      if (approved === true)
        await tx.wallet.upsert({
          where: { vendorId: id },
          create: { vendorId: id },
          update: {},
        });
      await audit(tx, {
        userId: admin.id,
        action: approved === true ? "VENDOR_APPROVE" : "VENDOR_UPDATE",
        entity: "Vendor",
        entityId: id,
        detail: { fields: Object.keys(data) },
      });
      return v;
    });

    return ok({ vendor: updated });
  },
);
