import { handler, ok, fail } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

export const GET = handler(async () => {
  const user = await getSessionUser();
  if (!user) return fail("ยังไม่ได้เข้าสู่ระบบ", 401);
  return ok({
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      vendorId: user.vendor?.id ?? null,
      shopName: user.vendor?.shopName ?? null,
      vendorApproved: user.vendor?.approved ?? null,
    },
  });
});
