import { handler, ok, fail } from "@/lib/api";
import { db } from "@/lib/db";
import { readBody, str } from "../_lib/http";

/** เรียกช่าง — เปิดให้ส่งได้โดยไม่ต้อง login (ทีมงานติดต่อกลับใน 24 ชม.) */
export const POST = handler(async (req: Request) => {
  const b = await readBody<Record<string, unknown>>(req);
  const name = str(b.name);
  const phoneRaw = str(b.phone);
  const machineType = str(b.machineType);
  const problem = str(b.problem);

  if (!name) return fail("กรุณากรอกชื่อผู้ติดต่อ");
  const phone = phoneRaw?.replace(/[-\s]/g, "");
  if (!phone || !/^0\d{8,9}$/.test(phone))
    return fail("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
  if (!machineType) return fail("กรุณาเลือก/กรอกชนิดเครื่องจักร");
  if (!problem) return fail("กรุณาอธิบายอาการเสีย");

  const request = await db.serviceRequest.create({
    data: {
      name,
      phone,
      machineType,
      problem,
      province: str(b.province) ?? null,
      status: "NEW",
    },
  });

  return ok(
    {
      request: {
        id: request.id,
        name: request.name,
        machineType: request.machineType,
        province: request.province,
        status: request.status,
        createdAt: request.createdAt,
      },
    },
    { status: 201 },
  );
});
