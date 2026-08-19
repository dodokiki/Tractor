import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AddressManager } from "@/components/store/address-manager";
import { LogoutButton } from "@/components/store/logout-button";

const ROLE_LABEL: Record<string, string> = {
  CUSTOMER: "ลูกค้า",
  VENDOR: "ร้านค้าพาร์ทเนอร์",
  ADMIN: "ผู้ดูแลระบบ",
};

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-3 py-6 sm:px-6 sm:py-10">
      <h1 className="text-xl font-bold text-ink sm:text-2xl">ข้อมูลของฉัน</h1>

      <section className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white"
          >
            {user.name.trim().charAt(0).toUpperCase() || "?"}
          </span>
          <div>
            <p className="text-lg font-bold text-ink">{user.name}</p>
            <p className="text-sm text-muted">{user.phone}</p>
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
          </div>
        </div>
        <LogoutButton />
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
        <h2 className="mb-3 text-sm font-bold text-ink">ที่อยู่จัดส่งของฉัน</h2>
        <AddressManager initialAddresses={addresses} />
      </section>
    </div>
  );
}
