import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CheckoutForm } from "@/components/store/checkout-form";
import { CheckoutSteps } from "@/components/store/checkout-steps";

export default async function CheckoutPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/checkout");

  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });

  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-6 sm:py-10">
      <h1 className="mb-6 text-xl font-bold text-ink sm:text-2xl">ชำระเงิน</h1>
      <CheckoutSteps current={1} />
      <CheckoutForm addresses={addresses} />
    </div>
  );
}
