import { db } from "@/lib/db";
import type { Prisma, WithdrawalStatus } from "@prisma/client";
import { formatBaht } from "@/lib/money";
import Card from "@/components/backoffice/Card";
import StatusChip from "@/components/backoffice/StatusChip";
import StatusFilter from "@/components/backoffice/StatusFilter";
import { formatDateThai } from "@/components/backoffice/dateUtils";
import WithdrawalActions from "@/components/backoffice/admin/WithdrawalActions";

const STATUS_OPTIONS = [
  { value: "", label: "ทุกสถานะ" },
  { value: "PENDING", label: "รออนุมัติ" },
  { value: "APPROVED", label: "อนุมัติแล้ว" },
  { value: "REJECTED", label: "ปฏิเสธ" },
  { value: "PAID", label: "จ่ายแล้ว" },
];
const VALID_STATUS = new Set(STATUS_OPTIONS.map((o) => o.value).filter(Boolean));

function parseBank(bankJson: string) {
  try {
    return JSON.parse(bankJson) as { bank?: string; accountNo?: string; accountName?: string };
  } catch {
    return {};
  }
}

export default async function AdminWithdrawalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const where: Prisma.WithdrawalRequestWhereInput =
    status && VALID_STATUS.has(status) ? { status: status as WithdrawalStatus } : {};

  const withdrawals = await db.withdrawalRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { vendor: true },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">คำขอถอนเงิน</h1>
          <p className="mt-1 text-sm text-muted">อนุมัติ/ปฏิเสธคำขอถอนเงินจากร้านค้า</p>
        </div>
        <StatusFilter value={status ?? ""} options={STATUS_OPTIONS} />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2 pr-3 font-medium">ร้านค้า</th>
                <th className="py-2 pr-3 font-medium">จำนวนเงิน</th>
                <th className="py-2 pr-3 font-medium">บัญชีธนาคาร</th>
                <th className="py-2 pr-3 font-medium">สถานะ</th>
                <th className="py-2 pr-3 font-medium">วันที่ขอ</th>
                <th className="py-2 pr-3 font-medium">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    ไม่พบคำขอถอนเงิน
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => {
                  const bank = parseBank(w.bankJson);
                  return (
                    <tr key={w.id} className="border-b border-line last:border-0">
                      <td className="py-2.5 pr-3 font-medium">
                        {w.vendor.logoEmoji} {w.vendor.shopName}
                      </td>
                      <td className="py-2.5 pr-3 font-semibold">{formatBaht(w.amountSatang)}</td>
                      <td className="py-2.5 pr-3">
                        <div>{bank.bank ?? "-"}</div>
                        <div className="text-xs text-muted">
                          {bank.accountNo} · {bank.accountName}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <StatusChip status={w.status} kind="withdrawal" />
                        {w.note ? (
                          <div className="mt-0.5 text-xs text-muted">{w.note}</div>
                        ) : null}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-muted">
                        {formatDateThai(w.createdAt)}
                      </td>
                      <td className="py-2.5 pr-3">
                        <WithdrawalActions id={w.id} status={w.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
