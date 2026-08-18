"use client";

import ActionButton from "@/components/backoffice/ActionButton";

export default function WithdrawalActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const url = `/api/admin/withdrawals/${id}`;

  if (status === "PENDING") {
    return (
      <div className="flex flex-wrap gap-2">
        <ActionButton
          url={url}
          body={{ action: "APPROVE" }}
          label="อนุมัติ"
          variant="primary"
          confirmMessage="ยืนยันอนุมัติคำขอถอนเงินนี้?"
        />
        <ActionButton
          url={url}
          variant="danger"
          label="ปฏิเสธ"
          getBody={() => {
            const note = window.prompt("ระบุเหตุผลที่ปฏิเสธคำขอนี้");
            if (note === null) return null;
            return { action: "REJECT", note };
          }}
        />
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <ActionButton
        url={url}
        body={{ action: "MARK_PAID" }}
        label="ทำเครื่องหมายจ่ายแล้ว"
        variant="primary"
        confirmMessage="ยืนยันว่าโอนเงินให้ร้านค้าเรียบร้อยแล้ว?"
      />
    );
  }

  return <span className="text-xs text-muted">-</span>;
}
