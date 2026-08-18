import { handler, ok, fail } from "@/lib/api";
import { createSession, verifyOtp } from "@/lib/auth";
import { db } from "@/lib/db";
import { readBody, str } from "../../_lib/http";

export const POST = handler(async (req: Request) => {
  const b = await readBody<{ phone?: string; code?: string; name?: string }>(
    req,
  );
  const phone = str(b.phone);
  const code = str(b.code);
  const name = str(b.name);
  if (!phone || !code) return fail("กรุณากรอกเบอร์โทรและรหัส OTP");

  const valid = await verifyOtp(phone, code);
  if (!valid) return fail("รหัส OTP ไม่ถูกต้องหรือหมดอายุ", 401);

  let user = await db.user.findUnique({
    where: { phone },
    include: { vendor: true },
  });
  if (!user) {
    user = await db.user.create({
      data: { phone, name: name || `คุณ${phone.slice(-4)}`, role: "CUSTOMER" },
      include: { vendor: true },
    });
  } else if (name && user.name !== name) {
    user = await db.user.update({
      where: { id: user.id },
      data: { name },
      include: { vendor: true },
    });
  }

  await createSession(user.id);

  return ok({
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      vendorId: user.vendor?.id ?? null,
      shopName: user.vendor?.shopName ?? null,
    },
  });
});
