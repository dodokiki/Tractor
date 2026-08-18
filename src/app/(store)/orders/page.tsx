import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBaht } from "@/lib/money";
import { OrderStatusChip } from "@/components/store/status-chip";

export default async function OrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/orders");

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { subOrders: { include: { vendor: { select: { shopName: true } } } } },
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-3 py-6 sm:px-6 sm:py-10">
      <h1 className="text-xl font-bold text-ink sm:text-2xl">คำสั่งซื้อของฉัน</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-10 text-center shadow-sm">
          <span className="text-4xl" aria-hidden>📦</span>
          <p className="text-sm text-muted">คุณยังไม่มีคำสั่งซื้อ</p>
          <Link
            href="/products"
            className="mt-1 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
          >
            เลือกซื้อสินค้า
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-bold text-ink">{o.code}</p>
                <p className="text-xs text-muted">
                  {new Date(o.createdAt).toLocaleDateString("th-TH", {
                    dateStyle: "medium",
                  })}{" "}
                  · {o.subOrders.map((s) => s.vendor.shopName).join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-primary">{formatBaht(o.totalSatang)}</span>
                <OrderStatusChip status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
