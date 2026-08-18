// เงินทุกจำนวนในระบบเก็บเป็น "สตางค์" (Int)

export function satangToBaht(satang: number): number {
  return satang / 100;
}

export function bahtToSatang(baht: number): number {
  return Math.round(baht * 100);
}

export function formatBaht(satang: number, withSymbol = true): string {
  const baht = satang / 100;
  const s = baht.toLocaleString("th-TH", {
    minimumFractionDigits: baht % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return withSymbol ? `฿${s}` : s;
}

/** คำนวณค่าคอมมิชชันจาก basis points (700 = 7%) — ปัดเศษเข้าแพลตฟอร์ม */
export function commission(amountSatang: number, bps: number): number {
  return Math.ceil((amountSatang * bps) / 10000);
}
