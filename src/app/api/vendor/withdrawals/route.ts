import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { requestWithdrawal } from "@/lib/wallet";
import { audit, int, readBody, str } from "../../_lib/http";
import { requireVendor } from "../../_lib/vendor";

export const GET = handler(async (req: Request) => {
  const vendor = await requireVendor(req);
  const rows = await db.withdrawalRequest.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
  });
  return ok({
    withdrawals: rows.map((w) => ({
      id: w.id,
      amountSatang: w.amountSatang,
      status: w.status,
      note: w.note,
      bank: JSON.parse(w.bankJson) as Record<string, string>,
      createdAt: w.createdAt,
      processedAt: w.processedAt,
    })),
  });
});

export const POST = handler(async (req: Request) => {
  const user = await requireUser("VENDOR");
  const vendor = await requireVendor(req);
  const b = await readBody<Record<string, unknown>>(req);

  const amountSatang = int(b.amountSatang);
  const bank = str(b.bank);
  const accountNo = str(b.accountNo);
  const accountName = str(b.accountName);
  if (amountSatang === undefined || amountSatang <= 0)
    return fail("กรุณาระบุยอดเงินที่ต้องการถอน");
  if (!bank || !accountNo || !accountName)
    return fail("กรุณากรอกข้อมูลบัญชีธนาคารให้ครบ");

  try {
    const wd = await requestWithdrawal(
      vendor.id,
      amountSatang,
      JSON.stringify({ bank, accountNo, accountName }),
    );
    await audit(db, {
      userId: user.id,
      action: "WITHDRAWAL_REQUEST",
      entity: "WithdrawalRequest",
      entityId: wd.id,
      detail: { amountSatang, vendorId: vendor.id, bank },
    });
    return ok({ withdrawal: wd }, { status: 201 });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "ขอถอนเงินไม่สำเร็จ");
  }
});
