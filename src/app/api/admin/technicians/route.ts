import { Prisma } from "@prisma/client";
import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, int, readBody, str } from "../../_lib/http";
import { joinList, machineCategory, toImage } from "../../_lib/rodlex";
import { applyTechnicianPatch } from "./_update";

const TECH_IMAGE = { emoji: "🧑‍🔧", from: "#1B7A43", to: "#2FA55C" };

/** สร้างรหัสช่างถัดไปแบบ RL-0001 */
async function nextCode() {
  const last = await db.technician.findMany({
    where: { code: { startsWith: "RL-" } },
    select: { code: true },
  });
  const max = last.reduce((m, t) => {
    const n = Number(t.code.slice(3));
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `RL-${String(max + 1).padStart(4, "0")}`;
}

export const GET = handler(async (req: Request) => {
  await requireUser("ADMIN");
  const sp = new URL(req.url).searchParams;
  const category = machineCategory(sp.get("category"));
  const q = str(sp.get("q"));

  const where: Prisma.TechnicianWhereInput = {};
  if (category) where.category = category;
  if (q)
    where.OR = [
      { name: { contains: q } },
      { code: { contains: q } },
      { skills: { contains: q } },
      { province: { contains: q } },
    ];

  const technicians = await db.technician.findMany({
    where,
    orderBy: [{ featured: "desc" }, { code: "asc" }],
  });
  return ok({ technicians, total: technicians.length });
});

export const POST = handler(async (req: Request) => {
  const admin = await requireUser("ADMIN");
  const b = await readBody<Record<string, unknown>>(req);
  const name = str(b.name);
  if (!name) return fail("กรุณากรอกชื่อช่าง");

  let code = str(b.code);
  if (code) {
    const dup = await db.technician.findUnique({ where: { code } });
    if (dup) return fail("รหัสช่างนี้ถูกใช้แล้ว");
  } else {
    code = await nextCode();
  }

  const featured = b.featured === true;
  if (featured)
    await db.technician.updateMany({
      where: { featured: true },
      data: { featured: false },
    });

  const rating =
    typeof b.rating === "number" && Number.isFinite(b.rating)
      ? Math.min(5, Math.max(0, b.rating))
      : 4.5;

  const technician = await db.technician.create({
    data: {
      code,
      name,
      bio: str(b.bio) ?? null,
      skills: joinList(b.skills),
      category: machineCategory(b.category) ?? "AGRICULTURE",
      province: str(b.province) ?? null,
      online: b.online === undefined ? true : b.online === true,
      jobsDone: Math.max(0, int(b.jobsDone, 0) ?? 0),
      rating,
      reviewCount: Math.max(0, int(b.reviewCount, 0) ?? 0),
      featured,
      imageJson: JSON.stringify(toImage(b.image, TECH_IMAGE)),
    },
  });

  await audit(db, {
    userId: admin.id,
    action: "TECHNICIAN_CREATE",
    entity: "Technician",
    entityId: technician.id,
    detail: { code, name },
  });
  return ok({ technician }, { status: 201 });
});

/** PATCH ที่ collection (ส่ง id มาใน body) ตามที่ระบุใน CONTRACT2 */
export const PATCH = handler(async (req: Request) => {
  const admin = await requireUser("ADMIN");
  const b = await readBody<Record<string, unknown>>(req);
  const id = str(b.id);
  if (!id) return fail("กรุณาระบุ id ของช่าง");
  return applyTechnicianPatch(admin.id, id, b);
});
