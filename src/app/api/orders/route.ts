import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { newOrderCode } from "@/lib/payment";
import {
  SHIPPING_SATANG,
  audit,
  int,
  parseAddress,
  parseImage,
  readBody,
  str,
} from "../_lib/http";

type CartItem = { productId?: string; qty?: number };
type AddressInput = Record<string, unknown>;

async function uniqueOrderCode(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const code = newOrderCode();
    const hit = await db.order.findUnique({ where: { code } });
    if (!hit) return code;
  }
  return `TH-${Date.now().toString().slice(-6)}`;
}

export const GET = handler(async () => {
  const user = await requireUser();
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      payment: true,
      subOrders: {
        include: {
          vendor: { select: { id: true, shopName: true, logoEmoji: true } },
          items: { include: { product: { select: { imageJson: true } } } },
        },
      },
    },
  });

  return ok({
    orders: orders.map((o) => ({
      id: o.id,
      code: o.code,
      status: o.status,
      itemsSatang: o.itemsSatang,
      shippingSatang: o.shippingSatang,
      discountSatang: o.discountSatang,
      totalSatang: o.totalSatang,
      couponCode: o.couponCode,
      createdAt: o.createdAt,
      address: parseAddress(o.addressJson),
      payment: o.payment,
      subOrders: o.subOrders.map((s) => ({
        id: s.id,
        status: s.status,
        itemsSatang: s.itemsSatang,
        vendor: s.vendor,
        items: s.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          name: it.nameSnapshot,
          priceSatang: it.priceSatang,
          qty: it.qty,
          image: parseImage(it.product?.imageJson),
        })),
      })),
    })),
  });
});

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const b = await readBody<{
    items?: CartItem[];
    addressId?: string;
    address?: AddressInput;
    couponCode?: string;
  }>(req);

  const rawItems = Array.isArray(b.items) ? b.items : [];
  const items = rawItems
    .map((i) => ({ productId: str(i.productId), qty: int(i.qty, 1) ?? 1 }))
    .filter((i): i is { productId: string; qty: number } => !!i.productId);
  if (!items.length) return fail("ไม่มีสินค้าในตะกร้า");
  if (items.some((i) => i.qty <= 0)) return fail("จำนวนสินค้าไม่ถูกต้อง");

  // รวมรายการซ้ำ
  const qtyByProduct = new Map<string, number>();
  for (const i of items)
    qtyByProduct.set(i.productId, (qtyByProduct.get(i.productId) ?? 0) + i.qty);

  // --- ที่อยู่จัดส่ง (snapshot) ---
  let addressSnapshot: Record<string, unknown> | null = null;
  const addressId = str(b.addressId);
  if (addressId) {
    const a = await db.address.findUnique({ where: { id: addressId } });
    if (!a || a.userId !== user.id) return fail("ไม่พบที่อยู่จัดส่งที่เลือก");
    addressSnapshot = {
      recipient: a.recipient,
      phone: a.phone,
      line1: a.line1,
      subdistrict: a.subdistrict,
      district: a.district,
      province: a.province,
      postcode: a.postcode,
    };
  } else if (b.address && typeof b.address === "object") {
    const a = b.address;
    const snap = {
      recipient: str(a.recipient),
      phone: str(a.phone),
      line1: str(a.line1),
      subdistrict: str(a.subdistrict),
      district: str(a.district),
      province: str(a.province),
      postcode: str(a.postcode),
    };
    if (Object.values(snap).some((v) => !v))
      return fail("กรุณากรอกที่อยู่จัดส่งให้ครบทุกช่อง");
    addressSnapshot = snap;
  }
  if (!addressSnapshot) return fail("กรุณาระบุที่อยู่จัดส่ง");

  const couponCode = str(b.couponCode)?.toUpperCase();
  const code = await uniqueOrderCode();

  try {
    const result = await db.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: [...qtyByProduct.keys()] } },
        include: { vendor: true },
      });
      if (products.length !== qtyByProduct.size)
        throw new OrderError("มีสินค้าบางรายการไม่พบในระบบแล้ว");

      // ตรวจสต็อก + สถานะสินค้า
      for (const p of products) {
        const qty = qtyByProduct.get(p.id)!;
        if (!p.active) throw new OrderError(`สินค้า "${p.name}" ปิดการขายแล้ว`);
        if (p.stock < qty)
          throw new OrderError(
            `สินค้า "${p.name}" มีสต็อกเหลือ ${p.stock} ชิ้น (สั่ง ${qty} ชิ้น)`,
          );
      }

      const itemsSatang = products.reduce(
        (sum, p) => sum + p.priceSatang * qtyByProduct.get(p.id)!,
        0,
      );

      // --- คูปองส่วนลด ---
      let discountSatang = 0;
      let appliedCoupon: string | null = null;
      if (couponCode) {
        const c = await tx.coupon.findUnique({ where: { code: couponCode } });
        if (!c) throw new OrderError("ไม่พบรหัสคูปองนี้");
        if (!c.active) throw new OrderError("คูปองนี้ถูกปิดใช้งานแล้ว");
        if (c.expiresAt && c.expiresAt < new Date())
          throw new OrderError("คูปองนี้หมดอายุแล้ว");
        if (itemsSatang < c.minTotalSatang)
          throw new OrderError(
            `คูปองนี้ใช้ได้เมื่อยอดสินค้าตั้งแต่ ฿${(c.minTotalSatang / 100).toLocaleString("th-TH")} ขึ้นไป`,
          );
        discountSatang =
          c.type === "PERCENT"
            ? Math.floor((itemsSatang * c.value) / 100)
            : c.value;
        discountSatang = Math.min(discountSatang, itemsSatang);
        appliedCoupon = c.code;
        await tx.coupon.update({
          where: { id: c.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      const shippingSatang = SHIPPING_SATANG;
      const totalSatang = itemsSatang + shippingSatang - discountSatang;

      const order = await tx.order.create({
        data: {
          code,
          userId: user.id,
          status: "PENDING_PAYMENT",
          itemsSatang,
          shippingSatang,
          discountSatang,
          totalSatang,
          couponCode: appliedCoupon,
          addressJson: JSON.stringify(addressSnapshot),
        },
      });

      // --- แยก SubOrder ตามร้าน ---
      const byVendor = new Map<string, typeof products>();
      for (const p of products) {
        const list = byVendor.get(p.vendorId) ?? [];
        list.push(p);
        byVendor.set(p.vendorId, list);
      }

      for (const [vendorId, list] of byVendor) {
        const subItemsSatang = list.reduce(
          (sum, p) => sum + p.priceSatang * qtyByProduct.get(p.id)!,
          0,
        );
        const sub = await tx.subOrder.create({
          data: {
            orderId: order.id,
            vendorId,
            status: "AWAITING_PAYMENT",
            itemsSatang: subItemsSatang,
          },
        });
        for (const p of list) {
          const qty = qtyByProduct.get(p.id)!;
          await tx.orderItem.create({
            data: {
              subOrderId: sub.id,
              productId: p.id,
              nameSnapshot: p.name,
              priceSatang: p.priceSatang,
              qty,
            },
          });
          await tx.product.update({
            where: { id: p.id },
            data: { stock: { decrement: qty } },
          });
        }
      }

      await audit(tx, {
        userId: user.id,
        action: "ORDER_CREATE",
        entity: "Order",
        entityId: order.id,
        detail: { code: order.code, totalSatang, couponCode: appliedCoupon },
      });

      return order;
    });

    return ok(
      {
        orderId: result.id,
        code: result.code,
        totalSatang: result.totalSatang,
        itemsSatang: result.itemsSatang,
        shippingSatang: result.shippingSatang,
        discountSatang: result.discountSatang,
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof OrderError) return fail(e.message);
    throw e;
  }
});

class OrderError extends Error {}
