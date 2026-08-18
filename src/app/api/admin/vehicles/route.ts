import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, readBody, str } from "../../_lib/http";

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export const GET = handler(async (req: Request) => {
  await requireUser("ADMIN");
  const q = str(new URL(req.url).searchParams.get("q"));

  const rows = await db.vehicle.findMany({
    where: q
      ? {
          OR: [
            { refCode: { contains: q } },
            { plateNo: { contains: q } },
            { owner: { name: { contains: q } } },
            { owner: { phone: { contains: q } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, name: true, phone: true } },
      tractorModel: true,
      logs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  return ok({
    vehicles: rows.map((v) => ({
      id: v.id,
      refCode: v.refCode,
      plateNo: v.plateNo,
      vin: v.vin,
      engineHours: v.engineHours,
      mileageKm: v.mileageKm,
      notes: v.notes,
      createdAt: v.createdAt,
      owner: v.owner,
      model: v.tractorModel
        ? { brand: v.tractorModel.brand, model: v.tractorModel.model }
        : null,
      logs: v.logs.map((l) => ({
        id: l.id,
        type: l.type,
        mileageKm: l.mileageKm,
        detail: l.detailJson ? safeParse(l.detailJson) : null,
        createdAt: l.createdAt,
      })),
    })),
  });
});

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export const POST = handler(async (req: Request) => {
  const admin = await requireUser("ADMIN");
  const b = await readBody<Record<string, unknown>>(req);
  const refCode = str(b.refCode);
  if (!refCode) return fail("กรุณากรอกรหัสอ้างอิงรถ (refCode)");
  if (await db.vehicle.findUnique({ where: { refCode } }))
    return fail("รหัสอ้างอิงนี้ถูกใช้แล้ว");

  const ownerId = str(b.ownerId);
  if (ownerId && !(await db.user.findUnique({ where: { id: ownerId } })))
    return fail("ไม่พบเจ้าของรถที่เลือก");
  const tractorModelId = str(b.tractorModelId);
  if (
    tractorModelId &&
    !(await db.tractorModel.findUnique({ where: { id: tractorModelId } }))
  )
    return fail("ไม่พบรุ่นรถที่เลือก");

  const vehicle = await db.vehicle.create({
    data: {
      refCode,
      ownerId: ownerId ?? null,
      tractorModelId: tractorModelId ?? null,
      plateNo: str(b.plateNo) ?? null,
      vin: str(b.vin) ?? null,
      engineHours: num(b.engineHours) ?? null,
      mileageKm: num(b.mileageKm) ?? null,
      notes: str(b.notes) ?? null,
    },
  });
  await audit(db, {
    userId: admin.id,
    action: "VEHICLE_CREATE",
    entity: "Vehicle",
    entityId: vehicle.id,
    detail: { refCode },
  });
  return ok({ vehicle }, { status: 201 });
});
