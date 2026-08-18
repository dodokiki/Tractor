import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBaht } from "@/lib/money";
import Card from "@/components/backoffice/Card";
import Forbidden from "@/components/backoffice/Forbidden";
import StatusChip from "@/components/backoffice/StatusChip";
import WithdrawForm from "@/components/backoffice/vendor/WithdrawForm";
import { formatDateThai } from "@/components/backoffice/dateUtils";

const TXN_LABEL: Record<string, string> = {
  SALE_CREDIT: "ยอดขาย",
  COMMISSION_FEE: "ค่าคอมมิชชัน",
  WITHDRAWAL: "ถอนเงิน",
  ADJUSTMENT: "ปรับปรุงยอด",
};

export default async function VendorWalletPage() {
  const user = await getSessionUser();
  const vendor = user?.vendor;
  if (!vendor) return <Forbidden message="บัญชีนี้ยังไม่ได้ผูกกับร้านค้า" />;

  const [wallet, withdrawals] = await Promise.all([
    db.wallet.findUnique({
      where: { vendorId: vendor.id },
      include: { transactions: { orderBy: { createdAt: "desc" }, take: 50 } },
    }),
    db.withdrawalRequest.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const balanceSatang = wallet?.balanceSatang ?? 0;
  const pendingSatang = wallet?.pendingSatang ?? 0;
  const transactions = wallet?.transactions ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">กระเป๋าเงิน</h1>
        <p className="mt-1 text-sm text-muted">ยอดเงินและประวัติรายการของร้าน {vendor.shopName}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="text-sm text-muted">ยอดคงเหลือ (ถอนได้)</div>
          <div className="mt-2 text-4xl font-extrabold text-primary">
            {formatBaht(balanceSatang)}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="text-sm text-muted">ยอดรอเคลียร์</div>
          <div className="mt-2 text-4xl font-extrabold text-accent">
            {formatBaht(pendingSatang)}
          </div>
        </div>
      </div>

      <Card title="ขอถอนเงิน">
        <WithdrawForm balanceSatang={balanceSatang} />
      </Card>

      {withdrawals.length > 0 ? (
        <Card title="คำขอถอนเงินล่าสุด">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="py-2 pr-3 font-medium">จำนวนเงิน</th>
                  <th className="py-2 pr-3 font-medium">สถานะ</th>
                  <th className="py-2 pr-3 font-medium">วันที่ขอ</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-3 font-semibold">{formatBaht(w.amountSatang)}</td>
                    <td className="py-2.5 pr-3">
                      <StatusChip status={w.status} kind="withdrawal" />
                      {w.note ? <div className="mt-0.5 text-xs text-muted">{w.note}</div> : null}
                    </td>
                    <td className="py-2.5 pr-3 text-muted">{formatDateThai(w.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      <Card title="ประวัติรายการ (Ledger)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2 pr-3 font-medium">ประเภท</th>
                <th className="py-2 pr-3 font-medium">รายละเอียด</th>
                <th className="py-2 pr-3 font-medium">จำนวนเงิน</th>
                <th className="py-2 pr-3 font-medium">วันที่</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted">
                    ยังไม่มีรายการ
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const positive = t.amountSatang >= 0;
                  return (
                    <tr key={t.id} className="border-b border-line last:border-0">
                      <td className="py-2.5 pr-3">{TXN_LABEL[t.type] ?? t.type}</td>
                      <td className="py-2.5 pr-3 text-muted">{t.note ?? "-"}</td>
                      <td
                        className={`py-2.5 pr-3 font-semibold ${
                          positive ? "text-primary" : "text-red-600"
                        }`}
                      >
                        {positive ? "+" : ""}
                        {formatBaht(t.amountSatang)}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-muted">
                        {formatDateThai(t.createdAt)}
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
