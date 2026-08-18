import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, int, readBody, str } from "../../_lib/http";

export const GET = handler(async () => {
  await requireUser("ADMIN");
  const rows = await db.vendor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, phone: true } },
      wallet: true,
      _count: { select: { products: true, subOrders: true } },
    },
  });
  return ok({
    vendors: rows.map((v) => ({
      id: v.id,
      shopName: v.shopName,
      description: v.description,
      logoEmoji: v.logoEmoji,
      themeColor: v.themeColor,
      commissionBps: v.commissionBps,
      approved: v.approved,
      createdAt: v.createdAt,
      owner: v.user,
      balanceSatang: v.wallet?.balanceSatang ?? 0,
      pendingSatang: v.wallet?.pendingSatang ?? 0,
      productCount: v._count.products,
      orderCount: v._count.subOrders,
    })),
  });
});

export const POST = handler(async (req: Request) => {
  const admin = await requireUser("ADMIN");
  const b = await readBody<Record<string, unknown>>(req);
  const shopName = str(b.shopName);
  const phone = str(b.phone);
  const ownerName = str(b.ownerName) ?? str(b.name);
  if (!shopName) return fail("กรุณากรอกชื่อร้าน");
  if (!phone || !/^0\d{8,9}$/.test(phone))
    return fail("กรุณากรอกเบอร์โทรเจ้าของร้านให้ถูกต้อง");

  try {
    const vendor = await db.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { phone },
        include: { vendor: true },
      });
      if (user?.vendor) throw new VendorError("เบอร์นี้มีร้านค้าอยู่แล้ว");
      if (!user) {
        user = await tx.user.create({
          data: { phone, name: ownerName ?? shopName, role: "VENDOR" },
          include: { vendor: true },
        });
      } else if (user.role === "CUSTOMER") {
        user = await tx.user.update({
          where: { id: user.id },
          data: { role: "VENDOR", name: ownerName ?? user.name },
          include: { vendor: true },
        });
      }

      const v = await tx.vendor.create({
        data: {
          userId: user.id,
          shopName,
          description: str(b.description) ?? null,
          logoEmoji: str(b.logoEmoji) ?? "🏪",
          themeColor: str(b.themeColor) ?? "1B7A43",
          commissionBps: int(b.commissionBps, 700) ?? 700,
          approved: b.approved === true,
        },
      });
      await tx.wallet.create({ data: { vendorId: v.id } });
      await audit(tx, {
        userId: admin.id,
        action: "VENDOR_CREATE",
        entity: "Vendor",
        entityId: v.id,
        detail: { shopName, phone },
      });
      return v;
    });
    return ok({ vendor }, { status: 201 });
  } catch (e) {
    if (e instanceof VendorError) return fail(e.message);
    throw e;
  }
});

class VendorError extends Error {}
