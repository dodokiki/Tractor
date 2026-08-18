import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { readBody, str } from "../_lib/http";

export const GET = handler(async () => {
  const user = await requireUser();
  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });
  return ok({ addresses });
});

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const b = await readBody<Record<string, unknown>>(req);
  const recipient = str(b.recipient);
  const phone = str(b.phone);
  const line1 = str(b.line1);
  const subdistrict = str(b.subdistrict);
  const district = str(b.district);
  const province = str(b.province);
  const postcode = str(b.postcode);
  if (
    !recipient ||
    !phone ||
    !line1 ||
    !subdistrict ||
    !district ||
    !province ||
    !postcode
  )
    return fail("กรุณากรอกที่อยู่จัดส่งให้ครบทุกช่อง");

  const isDefault = b.isDefault === true;
  const count = await db.address.count({ where: { userId: user.id } });

  const address = await db.$transaction(async (tx) => {
    if (isDefault)
      await tx.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    return tx.address.create({
      data: {
        userId: user.id,
        recipient,
        phone,
        line1,
        subdistrict,
        district,
        province,
        postcode,
        isDefault: isDefault || count === 0,
      },
    });
  });

  return ok({ address }, { status: 201 });
});
