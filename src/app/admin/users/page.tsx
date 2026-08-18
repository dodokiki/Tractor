import { db } from "@/lib/db";
import Card from "@/components/backoffice/Card";
import SearchBox from "@/components/backoffice/SearchBox";
import { formatDateThai } from "@/components/backoffice/dateUtils";

const ROLE_LABEL: Record<string, string> = {
  CUSTOMER: "ลูกค้า",
  VENDOR: "ร้านค้า",
  ADMIN: "แอดมิน",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const users = await db.user.findMany({
    where: q
      ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { vendor: true },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">ผู้ใช้</h1>
          <p className="mt-1 text-sm text-muted">ผู้ใช้งานทั้งหมดในระบบ</p>
        </div>
        <SearchBox defaultValue={q ?? ""} placeholder="ค้นหาชื่อ/เบอร์โทร" />
      </div>

      <Card title={`ผู้ใช้ทั้งหมด (${users.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2 pr-3 font-medium">ชื่อ</th>
                <th className="py-2 pr-3 font-medium">เบอร์โทร</th>
                <th className="py-2 pr-3 font-medium">บทบาท</th>
                <th className="py-2 pr-3 font-medium">สมัครเมื่อ</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted">
                    ไม่พบผู้ใช้
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-3 font-medium">
                      {u.name}
                      {u.vendor ? (
                        <span className="ml-1 text-xs text-muted">({u.vendor.shopName})</span>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-3">{u.phone}</td>
                    <td className="py-2.5 pr-3">{ROLE_LABEL[u.role] ?? u.role}</td>
                    <td className="py-2.5 pr-3 text-muted">{formatDateThai(u.createdAt)}</td>
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
