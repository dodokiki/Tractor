import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, int, parseImage, readBody, str } from "../../_lib/http";
import { requireVendor } from "../../_lib/vendor";

export const GET = handler(async (req: Request) => {
  const vendor = await requireVendor(req);
  const rows = await db.product.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true, slug: true, emoji: true } },
    },
  });
  return ok({
    products: rows.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      partCode: p.partCode,
      brand: p.brand,
      description: p.description,
      priceSatang: p.priceSatang,
      stock: p.stock,
      active: p.active,
      image: parseImage(p.imageJson),
      category: p.category,
      createdAt: p.createdAt,
    })),
  });
});

export const POST = handler(async (req: Request) => {
  const user = await requireUser("VENDOR");
  const vendor = await requireVendor(req);
  const b = await readBody<Record<string, unknown>>(req);

  const name = str(b.name);
  const categoryId = str(b.categoryId);
  const priceSatang = int(b.priceSatang);
  if (!name) return fail("กรุณากรอกชื่อสินค้า");
  if (!categoryId) return fail("กรุณาเลือกหมวดหมู่สินค้า");
  if (priceSatang === undefined || priceSatang <= 0)
    return fail("ราคาสินค้าไม่ถูกต้อง");

  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) return fail("ไม่พบหมวดหมู่ที่เลือก");

  const sku =
    str(b.sku) ??
    `SKU-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
  if (await db.product.findUnique({ where: { sku } }))
    return fail("รหัสสินค้า (SKU) นี้ถูกใช้แล้ว");

  const image = {
    emoji: str(b.emoji) ?? "🔩",
    from: str(b.gradientFrom) ?? "#1B7A43",
    to: str(b.gradientTo) ?? "#2FA55C",
  };

  const product = await db.product.create({
    data: {
      vendorId: vendor.id,
      categoryId,
      name,
      sku,
      partCode: str(b.partCode) ?? null,
      brand: str(b.brand) ?? null,
      description: str(b.description) ?? null,
      priceSatang,
      stock: int(b.stock, 0) ?? 0,
      imageJson: str(b.imageJson) ?? JSON.stringify(image),
      active: b.active === undefined ? true : b.active === true,
    },
  });

  await audit(db, {
    userId: user.id,
    action: "PRODUCT_CREATE",
    entity: "Product",
    entityId: product.id,
    detail: { name: product.name, priceSatang: product.priceSatang },
  });

  return ok({ product }, { status: 201 });
});
