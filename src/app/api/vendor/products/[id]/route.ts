import type { Prisma } from "@prisma/client";
import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, bool, int, readBody, str } from "../../../_lib/http";
import { requireVendor } from "../../../_lib/vendor";

async function loadOwned(req: Request, id: string) {
  const vendor = await requireVendor(req);
  const product = await db.product.findUnique({ where: { id } });
  if (!product || product.vendorId !== vendor.id) return null;
  return product;
}

export const PATCH = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const user = await requireUser("VENDOR");
    const { id } = await ctx.params;
    const product = await loadOwned(req, id);
    if (!product) return fail("ไม่พบสินค้าในร้านของคุณ", 404);

    const b = await readBody<Record<string, unknown>>(req);
    const data: Prisma.ProductUpdateInput = {};
    const name = str(b.name);
    if (name) data.name = name;
    if (b.description !== undefined) data.description = str(b.description) ?? null;
    if (b.partCode !== undefined) data.partCode = str(b.partCode) ?? null;
    if (b.brand !== undefined) data.brand = str(b.brand) ?? null;
    const price = int(b.priceSatang);
    if (price !== undefined) {
      if (price <= 0) return fail("ราคาสินค้าไม่ถูกต้อง");
      data.priceSatang = price;
    }
    const stock = int(b.stock);
    if (stock !== undefined) {
      if (stock < 0) return fail("จำนวนสต็อกไม่ถูกต้อง");
      data.stock = stock;
    }
    const active = bool(b.active);
    if (active !== undefined) data.active = active;
    const imageJson = str(b.imageJson);
    if (imageJson) data.imageJson = imageJson;
    else if (b.emoji || b.gradientFrom || b.gradientTo) {
      data.imageJson = JSON.stringify({
        emoji: str(b.emoji) ?? "🔩",
        from: str(b.gradientFrom) ?? "#1B7A43",
        to: str(b.gradientTo) ?? "#2FA55C",
      });
    }
    const categoryId = str(b.categoryId);
    if (categoryId) {
      const cat = await db.category.findUnique({ where: { id: categoryId } });
      if (!cat) return fail("ไม่พบหมวดหมู่ที่เลือก");
      data.category = { connect: { id: categoryId } };
    }

    const updated = await db.product.update({ where: { id }, data });
    await audit(db, {
      userId: user.id,
      action: "PRODUCT_UPDATE",
      entity: "Product",
      entityId: id,
      detail: { fields: Object.keys(data) },
    });
    return ok({ product: updated });
  },
);

export const DELETE = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const user = await requireUser("VENDOR");
    const { id } = await ctx.params;
    const product = await loadOwned(req, id);
    if (!product) return fail("ไม่พบสินค้าในร้านของคุณ", 404);

    // ถ้าเคยมีคำสั่งซื้อแล้วให้ปิดการขายแทนการลบ (รักษาประวัติ)
    const used = await db.orderItem.count({ where: { productId: id } });
    if (used > 0) {
      await db.product.update({ where: { id }, data: { active: false } });
      await audit(db, {
        userId: user.id,
        action: "PRODUCT_DEACTIVATE",
        entity: "Product",
        entityId: id,
      });
      return ok({ deactivated: true });
    }

    await db.product.delete({ where: { id } });
    await audit(db, {
      userId: user.id,
      action: "PRODUCT_DELETE",
      entity: "Product",
      entityId: id,
    });
    return ok({ deleted: true });
  },
);
