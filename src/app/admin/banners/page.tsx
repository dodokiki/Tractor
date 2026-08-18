import { db } from "@/lib/db";
import Card from "@/components/backoffice/Card";
import Toggle from "@/components/backoffice/Toggle";
import ActionButton from "@/components/backoffice/ActionButton";
import PromoTabs from "@/components/backoffice/admin/PromoTabs";
import AddBannerForm from "@/components/backoffice/admin/AddBannerForm";

export default async function AdminBannersPage() {
  const banners = await db.banner.findMany({ orderBy: { sort: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">คูปอง/แบนเนอร์</h1>
        <p className="mt-1 text-sm text-muted">จัดการแบนเนอร์โปรโมชันหน้าแรก</p>
      </div>

      <PromoTabs active="banners" />

      <Card title="เพิ่มแบนเนอร์ใหม่">
        <AddBannerForm />
      </Card>

      <Card title={`แบนเนอร์ทั้งหมด (${banners.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2 pr-3 font-medium">หัวข้อ</th>
                <th className="py-2 pr-3 font-medium">คำอธิบาย</th>
                <th className="py-2 pr-3 font-medium">ปุ่ม</th>
                <th className="py-2 pr-3 font-medium">ลำดับ</th>
                <th className="py-2 pr-3 font-medium">เปิดใช้งาน</th>
                <th className="py-2 pr-3 font-medium">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    ยังไม่มีแบนเนอร์
                  </td>
                </tr>
              ) : (
                banners.map((b) => (
                  <tr key={b.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{b.title}</td>
                    <td className="py-2.5 pr-3 text-muted">{b.subtitle ?? "-"}</td>
                    <td className="py-2.5 pr-3">
                      {b.ctaText ? (
                        <span>
                          {b.ctaText} <span className="text-muted">→ {b.ctaHref}</span>
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-2.5 pr-3">{b.sort}</td>
                    <td className="py-2.5 pr-3">
                      <Toggle url={`/api/admin/banners/${b.id}`} field="active" value={b.active} />
                    </td>
                    <td className="py-2.5 pr-3">
                      <ActionButton
                        url={`/api/admin/banners/${b.id}`}
                        method="DELETE"
                        label="ลบ"
                        variant="danger"
                        confirmMessage={`ลบแบนเนอร์ "${b.title}"?`}
                      />
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
