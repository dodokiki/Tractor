import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import Sidebar from "@/components/backoffice/Sidebar";
import Forbidden from "@/components/backoffice/Forbidden";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/vendor");
  if (user.role !== "VENDOR" && user.role !== "ADMIN") return <Forbidden />;
  if (user.role === "VENDOR" && !user.vendor) {
    return <Forbidden message="บัญชีนี้ยังไม่ได้ผูกกับร้านค้า กรุณาติดต่อผู้ดูแลระบบ" />;
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar
        role="VENDOR"
        title="พอร์ทัลร้านค้า"
        subtitle={user.vendor?.shopName ?? user.name}
      />
      <main className="flex-1 overflow-x-hidden p-6 lg:p-8">{children}</main>
    </div>
  );
}
