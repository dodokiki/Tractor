import { handler, ok, fail } from "@/lib/api";
import { issueOtp } from "@/lib/auth";
import { isMockPayment } from "@/lib/payment";
import { readBody, str } from "../../_lib/http";

export const POST = handler(async (req: Request) => {
  const b = await readBody<{ phone?: string }>(req);
  const phone = str(b.phone);
  if (!phone || !/^0\d{8,9}$/.test(phone))
    return fail("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 0811111111)");

  const code = await issueOtp(phone);
  return ok({ sent: true, devCode: isMockPayment() ? code : undefined });
});
