"use client";

import { useState } from "react";
import { formatBaht } from "@/lib/money";
import StatusChip from "@/components/backoffice/StatusChip";
import ActionButton from "@/components/backoffice/ActionButton";
import { formatDateThai } from "@/components/backoffice/dateUtils";
import type { Order, Payment, SubOrder, Vendor, OrderItem, User } from "@prisma/client";

type FullOrder = Order & {
  user: User;
  payment: Payment | null;
  subOrders: (SubOrder & { vendor: Vendor; items: OrderItem[] })[];
};

export default function OrderRow({ order }: { order: FullOrder }) {
  const [open, setOpen] = useState(false);
  const canConfirmPayment =
    order.payment &&
    order.payment.status === "PENDING" &&
    (order.payment.method === "BANK_TRANSFER" || order.payment.method === "PROMPTPAY");

  return (
    <>
      <tr className="border-b border-line last:border-0">
        <td className="py-2.5 pr-3 font-medium">{order.code}</td>
        <td className="py-2.5 pr-3">
          {order.user.name}
          <div className="text-xs text-muted">{order.user.phone}</div>
        </td>
        <td className="py-2.5 pr-3">{formatBaht(order.totalSatang)}</td>
        <td className="py-2.5 pr-3">
          {order.payment ? (
            <>
              <StatusChip status={order.payment.status} kind="payment" />
              <div className="mt-0.5 text-xs text-muted">{order.payment.method}</div>
            </>
          ) : (
            "-"
          )}
        </td>
        <td className="py-2.5 pr-3">
          <StatusChip status={order.status} kind="order" />
        </td>
        <td className="py-2.5 pr-3 whitespace-nowrap text-muted">
          {formatDateThai(order.createdAt)}
        </td>
        <td className="py-2.5 pr-3">
          <div className="flex flex-wrap items-center gap-2">
            {canConfirmPayment ? (
              <ActionButton
                url={`/api/admin/payments/${order.id}/confirm`}
                label="ยืนยันยอดโอน"
                confirmMessage={`ยืนยันว่าได้รับยอดโอนสำหรับคำสั่งซื้อ ${order.code} แล้ว?`}
              />
            ) : null}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface"
            >
              {open ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}
            </button>
          </div>
        </td>
      </tr>
      {open ? (
        <tr className="border-b border-line last:border-0 bg-surface/60">
          <td colSpan={7} className="px-3 py-3">
            <div className="space-y-3">
              {order.payment?.slipNote ? (
                <div className="text-xs text-muted">
                  หมายเหตุแจ้งโอน: {order.payment.slipNote}
                </div>
              ) : null}
              {order.subOrders.map((so) => (
                <div key={so.id} className="rounded-xl border border-line bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold text-ink">
                      {so.vendor.logoEmoji} {so.vendor.shopName}
                    </div>
                    <StatusChip status={so.status} kind="suborder" />
                  </div>
                  <ul className="space-y-1 text-sm text-muted">
                    {so.items.map((it) => (
                      <li key={it.id} className="flex justify-between">
                        <span>
                          {it.nameSnapshot} × {it.qty}
                        </span>
                        <span>{formatBaht(it.priceSatang * it.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex justify-end gap-4 border-t border-line pt-2 text-xs">
                    <span>
                      คอมมิชชัน: <b>{formatBaht(so.commissionSatang)}</b>
                    </span>
                    <span>
                      ยอดสุทธิร้าน: <b>{formatBaht(so.netSatang)}</b>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
