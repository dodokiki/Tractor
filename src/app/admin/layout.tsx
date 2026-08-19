import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import Sidebar from "@/components/backoffice/Sidebar";
import Forbidden from "@/components/backoffice/Forbidden";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") return <Forbidden />;

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar role="ADMIN" title="หลังบ้านแอดมิน" subtitle={user.name} />
      <main className="flex-1 overflow-x-hidden p-6 lg:p-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
