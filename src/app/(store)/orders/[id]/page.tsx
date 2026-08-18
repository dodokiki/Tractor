import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBaht } from "@/lib/money";
import { OrderStatusChip, SubOrderStatusChip } from "@/components/store/status-chip";

type AddressSnapshot = {
  recipient?: string;
  phone?: string;
  line1?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  postcode?: string;
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CARD: "บัตรเครดิต/เดบิต",
  BANK_TRANSFER: "โอนผ่านธนาคาร",
  PROMPTPAY: "พร้อมเพย์ (QR)",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const [user, { id }, sp] = await Promise.all([getSessionUser(), params, searchParams]);
  if (!user) redirect(`/login?next=/orders/${id}`);

  const order = await db.order.findUnique({
    where: { id },
    include: {
      subOrders: {
        include: {
          vendor: { select: { shopName: true, logoEmoji: true } },
          items: true,
        },
      },
      payment: true,
    },
  });

  if (!order || (order.userId !== user.id && user.role !== "ADMIN")) notFound();

  let address: AddressSnapshot = {};
  try {
    address = JSON.parse(order.addressJson) as AddressSnapshot;
  } catch {
    address = {};
  }

  const needsPayment = order.status === "PENDING_PAYMENT";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-3 py-6 sm:px-6 sm:py-10">
      {sp.success === "1" && (
        <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
          🎉 สั่งซื้อและชำระเงินสำเร็จ ขอบคุณที่ใช้บริการ TractorHub
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="text-lg font-bold text-ink sm:text-xl">คำสั่งซื้อ {order.code}</h1>
          <p className="text-xs text-muted">
            สั่งซื้อเมื่อ{" "}
            {new Date(order.createdAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <OrderStatusChip status={order.status} />
      </div>

      {needsPayment && (
        <Link
          href={`/checkout/pay/${order.id}`}
          className="rounded-2xl bg-accent px-4 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-accent-dark"
        >
          ไปชำระเงินสำหรับคำสั่งซื้อนี้ →
        </Link>
      )}

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
        <h2 className="mb-2 text-sm font-bold text-ink">ที่อยู่จัดส่ง</h2>
        <p className="text-sm text-muted">
          {address.recipient} · {address.phone}
          <br />
          {address.line1} ต.{address.subdistrict} อ.{address.district} จ.{address.province}{" "}
          {address.postcode}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
        <h2 className="mb-2 text-sm font-bold text-ink">การชำระเงิน</h2>
        <p className="text-sm text-muted">
          วิธีชำระ:{" "}
          {order.payment ? PAYMENT_METHOD_LABEL[order.payment.method] ?? order.payment.method : "-"}
        </p>
        <p className="text-sm text-muted">สถานะ: {order.payment?.status ?? "-"}</p>
      </section>

      <div className="flex flex-col gap-4">
        {order.subOrders.map((so) => (
          <section key={so.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                {so.vendor.logoEmoji} {so.vendor.shopName}
              </p>
              <SubOrderStatusChip status={so.status} />
            </div>
            <div className="flex flex-col divide-y divide-line">
              {so.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-ink">
                    {item.nameSnapshot} × {item.qty}
                  </span>
                  <span className="font-semibold text-ink">
                    {formatBaht(item.priceSatang * item.qty)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-right text-sm font-bold text-primary">
              รวม {formatBaht(so.itemsSatang)}
            </p>
          </section>
        ))}
      </div>

      <section className="flex flex-col gap-1.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted">ยอดสินค้า</span>
          <span className="text-ink">{formatBaht(order.itemsSatang)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">ค่าจัดส่ง</span>
          <span className="text-ink">{formatBaht(order.shippingSatang)}</span>
        </div>
        {order.discountSatang > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted">ส่วนลด{order.couponCode ? ` (${order.couponCode})` : ""}</span>
            <span className="text-red-600">-{formatBaht(order.discountSatang)}</span>
          </div>
        )}
        <div className="mt-1 flex justify-between border-t border-line pt-2 text-base">
          <span className="font-bold text-ink">ยอดสุทธิ</span>
          <span className="font-extrabold text-primary">{formatBaht(order.totalSatang)}</span>
        </div>
      </section>
    </div>
  );
}
