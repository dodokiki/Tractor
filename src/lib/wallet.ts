import { Prisma } from "@prisma/client";
import { db } from "./db";
import { commission } from "./money";

type Tx = Prisma.TransactionClient;

/**
 * เมื่อคำสั่งซื้อ "ชำระเงินแล้ว": ยอดขายของแต่ละร้านเข้าเป็นยอดรอเคลียร์ (pending)
 * เรียกภายใน db.$transaction เดียวกับการอัปเดตสถานะ Payment
 */
export async function creditPendingOnPaid(tx: Tx, orderId: string) {
  const subOrders = await tx.subOrder.findMany({
    where: { orderId },
    include: { vendor: true },
  });
  for (const so of subOrders) {
    const fee = commission(so.itemsSatang, so.vendor.commissionBps);
    const net = so.itemsSatang - fee;
    await tx.subOrder.update({
      where: { id: so.id },
      data: { status: "PENDING_CONFIRM", commissionSatang: fee, netSatang: net },
    });
    await tx.wallet.upsert({
      where: { vendorId: so.vendorId },
      create: { vendorId: so.vendorId, pendingSatang: net },
      update: { pendingSatang: { increment: net } },
    });
  }
}

/**
 * เมื่อ SubOrder "สำเร็จ" (COMPLETED): ย้ายยอดจาก pending เข้า balance จริง
 * พร้อมบันทึกรายการเข้า-ออก (ยอดขาย + ค่าคอมมิชชัน) เพื่อการตรวจสอบย้อนหลัง
 */
export async function settleSubOrder(subOrderId: string) {
  return db.$transaction(async (tx) => {
    const so = await tx.subOrder.findUniqueOrThrow({
      where: { id: subOrderId },
      include: { vendor: true, order: true },
    });
    if (so.status !== "SHIPPED" && so.status !== "CONFIRMED")
      throw new Error("สถานะไม่พร้อมปิดงาน");
    if (so.settledAt) throw new Error("ปิดยอดไปแล้ว");

    const wallet = await tx.wallet.upsert({
      where: { vendorId: so.vendorId },
      create: { vendorId: so.vendorId },
      update: {},
    });
    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        pendingSatang: { decrement: so.netSatang },
        balanceSatang: { increment: so.netSatang },
      },
    });
    await tx.walletTransaction.createMany({
      data: [
        {
          walletId: wallet.id,
          type: "SALE_CREDIT",
          amountSatang: so.itemsSatang,
          note: `ยอดขายคำสั่งซื้อ ${so.order.code}`,
          subOrderId: so.id,
        },
        {
          walletId: wallet.id,
          type: "COMMISSION_FEE",
          amountSatang: -so.commissionSatang,
          note: `ค่าคอมมิชชันแพลตฟอร์ม ${(so.vendor.commissionBps / 100).toFixed(2)}%`,
          subOrderId: so.id,
        },
      ],
    });
    const updated = await tx.subOrder.update({
      where: { id: so.id },
      data: { status: "COMPLETED", settledAt: new Date() },
    });

    // ถ้า SubOrder ทุกใบของ Order นี้จบแล้ว → ปิด Order เป็น COMPLETED
    const remaining = await tx.subOrder.count({
      where: { orderId: so.orderId, status: { notIn: ["COMPLETED", "CANCELLED"] } },
    });
    if (remaining === 0) {
      await tx.order.update({
        where: { id: so.orderId },
        data: { status: "COMPLETED" },
      });
    }
    return updated;
  });
}

/** ขอถอนเงิน: ตัดจาก balance ทันที (จองยอด) รออนุมัติ */
export async function requestWithdrawal(
  vendorId: string,
  amountSatang: number,
  bankJson: string,
) {
  return db.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUniqueOrThrow({ where: { vendorId } });
    if (amountSatang <= 0 || amountSatang > wallet.balanceSatang)
      throw new Error("ยอดถอนไม่ถูกต้องหรือเกินยอดคงเหลือ");
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balanceSatang: { decrement: amountSatang } },
    });
    const wd = await tx.withdrawalRequest.create({
      data: { vendorId, amountSatang, bankJson },
    });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "WITHDRAWAL",
        amountSatang: -amountSatang,
        note: `คำขอถอนเงิน #${wd.id.slice(-6).toUpperCase()}`,
      },
    });
    return wd;
  });
}

/** แอดมินปฏิเสธคำขอถอน: คืนยอดเข้ากระเป๋า */
export async function rejectWithdrawal(id: string, note?: string) {
  return db.$transaction(async (tx) => {
    const wd = await tx.withdrawalRequest.findUniqueOrThrow({ where: { id } });
    if (wd.status !== "PENDING") throw new Error("คำขอนี้ถูกดำเนินการไปแล้ว");
    const wallet = await tx.wallet.findUniqueOrThrow({
      where: { vendorId: wd.vendorId },
    });
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balanceSatang: { increment: wd.amountSatang } },
    });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "ADJUSTMENT",
        amountSatang: wd.amountSatang,
        note: `คืนยอด — ปฏิเสธคำขอถอน #${wd.id.slice(-6).toUpperCase()}`,
      },
    });
    return tx.withdrawalRequest.update({
      where: { id },
      data: { status: "REJECTED", note, processedAt: new Date() },
    });
  });
}
