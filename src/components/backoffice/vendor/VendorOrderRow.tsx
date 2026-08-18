"use client";

import { useState } from "react";
import { formatBaht } from "@/lib/money";
import StatusChip from "@/components/backoffice/StatusChip";
import ActionButton from "@/components/backoffice/ActionButton";
import { formatDateThai } from "@/components/backoffice/dateUtils";
import type { SubOrder, OrderItem, Order } from "@prisma/client";

type FullSubOrder = SubOrder & { items: OrderItem[]; order: Order };

const NEXT_STEP: Record<string, { status: string; label: string; confirm: string } | undefined> = {
  PENDING_CONFIRM: { status: "CONFIRMED", label: "ยืนยันออเดอร์", confirm: "ยืนยันรับออเดอร์นี้?" },
  CONFIRMED: { status: "SHIPPED", label: "จัดส่งแล้ว", confirm: "ยืนยันว่าจัดส่งสินค้าแล้ว?" },
  SHIPPED: { status: "COMPLETED", label: "งานสำเร็จ", confirm: "ยืนยันว่างานเสร็จสิ้น? ระบบจะโอนยอดเข้ากระเป๋าอัตโนมัติ" },
};

function parseAddress(addressJson: string) {
  try {
    return JSON.parse(addressJson) as {
      recipient?: string;
      phone?: string;
      line1?: string;
      district?: string;
      province?: string;
    };
  } catch {
    return {};
  }
}

export default function VendorOrderRow({ subOrder }: { subOrder: FullSubOrder }) {
  const [open, setOpen] = useState(false);
  const address = parseAddress(subOrder.order.addressJson);
  const next = NEXT_STEP[subOrder.status];

  return (
    <>
      <tr className="border-b border-line last:border-0">
        <td className="py-2.5 pr-3 font-medium">{subOrder.order.code}</td>
        <td className="py-2.5 pr-3">
          {address.recipient ?? "-"}
          <div className="text-xs text-muted">{address.phone}</div>
        </td>
        <td className="py-2.5 pr-3">{formatBaht(subOrder.itemsSatang)}</td>
        <td className="py-2.5 pr-3">
          <StatusChip status={subOrder.status} kind="suborder" />
        </td>
        <td className="py-2.5 pr-3 whitespace-nowrap text-muted">
          {formatDateThai(subOrder.order.createdAt)}
        </td>
        <td className="py-2.5 pr-3">
          <div className="flex flex-wrap items-center gap-2">
            {next ? (
              <ActionButton
                url={`/api/vendor/orders/${subOrder.id}/status`}
                body={{ status: next.status }}
                label={next.label}
                confirmMessage={next.confirm}
              />
            ) : null}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface"
            >
              {open ? "ซ่อน" : "รายการสินค้า"}
            </button>
          </div>
        </td>
      </tr>
      {open ? (
        <tr className="border-b border-line last:border-0 bg-surface/60">
          <td colSpan={6} className="px-3 py-3">
            <div className="rounded-xl border border-line bg-white p-3">
              <div className="mb-1 text-xs text-muted">
                ที่อยู่จัดส่ง: {address.line1} {address.district} {address.province}
              </div>
              <ul className="space-y-1 text-sm">
                {subOrder.items.map((it) => (
                  <li key={it.id} className="flex justify-between text-muted">
                    <span>
                      {it.nameSnapshot} × {it.qty}
                    </span>
                    <span>{formatBaht(it.priceSatang * it.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
