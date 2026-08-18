import { db } from "@/lib/db";
import Card from "@/components/backoffice/Card";
import AddVehicleForm from "@/components/backoffice/admin/AddVehicleForm";

export default async function AdminVehiclesPage() {
  const vehicles = await db.vehicle.findMany({
    orderBy: { createdAt: "desc" },
    include: { owner: true, tractorModel: true },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">ประวัติรถ</h1>
        <p className="mt-1 text-sm text-muted">
          ทะเบียนรถแทรกเตอร์และประวัติการใช้งาน (โครงเฟส 4 — รองรับ RFID)
        </p>
      </div>

      <Card title="เพิ่มรถใหม่">
        <AddVehicleForm />
      </Card>

      <Card title={`รถทั้งหมด (${vehicles.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2 pr-3 font-medium">รหัสอ้างอิง</th>
                <th className="py-2 pr-3 font-medium">รุ่น</th>
                <th className="py-2 pr-3 font-medium">ทะเบียน</th>
                <th className="py-2 pr-3 font-medium">เจ้าของ</th>
                <th className="py-2 pr-3 font-medium">เลขไมล์</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    ยังไม่มีข้อมูลรถ
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-3 font-mono font-semibold">{v.refCode}</td>
                    <td className="py-2.5 pr-3">
                      {v.tractorModel
                        ? `${v.tractorModel.brand} ${v.tractorModel.model}`
                        : "-"}
                    </td>
                    <td className="py-2.5 pr-3">{v.plateNo ?? "-"}</td>
                    <td className="py-2.5 pr-3">{v.owner?.name ?? "-"}</td>
                    <td className="py-2.5 pr-3">
                      {v.mileageKm != null ? `${v.mileageKm.toLocaleString("th-TH")} กม.` : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
