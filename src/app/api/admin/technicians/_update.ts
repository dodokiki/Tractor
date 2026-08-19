// ตรรกะแก้ไขช่างที่ใช้ร่วมกันระหว่าง PATCH /api/admin/technicians (id ใน body)
// และ PATCH /api/admin/technicians/[id] — ไม่ใช่ route
import type { Prisma } from "@prisma/client";
import { ok, fail } from "@/lib/api";
import { db } from "@/lib/db";
import { audit, bool, int, str } from "../../_lib/http";
import { joinList, machineCategory, toImage } from "../../_lib/rodlex";

const TECH_IMAGE = { emoji: "🧑‍🔧", from: "#1B7A43", to: "#2FA55C" };

export async function applyTechnicianPatch(
  adminId: string,
  id: string,
  b: Record<string, unknown>,
): Promise<Response> {
  const current = await db.technician.findUnique({ where: { id } });
  if (!current) return fail("ไม่พบช่างคนนี้", 404);

  const data: Prisma.TechnicianUpdateInput = {};
  const name = str(b.name);
  if (name) data.name = name;
  const code = str(b.code);
  if (code && code !== current.code) {
    const dup = await db.technician.findUnique({ where: { code } });
    if (dup) return fail("รหัสช่างนี้ถูกใช้แล้ว");
    data.code = code;
  }
  if (b.bio !== undefined) data.bio = str(b.bio) ?? null;
  if (b.skills !== undefined) data.skills = joinList(b.skills);
  const category = machineCategory(b.category);
  if (category) data.category = category;
  if (b.province !== undefined) data.province = str(b.province) ?? null;
  const online = bool(b.online);
  if (online !== undefined) data.online = online;
  const featured = bool(b.featured);
  if (featured !== undefined) data.featured = featured;
  const jobsDone = int(b.jobsDone);
  if (jobsDone !== undefined) data.jobsDone = Math.max(0, jobsDone);
  if (typeof b.rating === "number" && Number.isFinite(b.rating))
    data.rating = Math.min(5, Math.max(0, b.rating));
  const reviewCount = int(b.reviewCount);
  if (reviewCount !== undefined) data.reviewCount = Math.max(0, reviewCount);
  if (b.image !== undefined)
    data.imageJson = JSON.stringify(toImage(b.image, TECH_IMAGE));

  if (!Object.keys(data).length) return fail("ไม่มีข้อมูลที่ต้องแก้ไข");

  // ช่างสปอตไลต์มีได้คนเดียว
  if (featured === true) {
    await db.technician.updateMany({
      where: { featured: true, id: { not: id } },
      data: { featured: false },
    });
  }

  const technician = await db.technician.update({ where: { id }, data });
  await audit(db, {
    userId: adminId,
    action: "TECHNICIAN_UPDATE",
    entity: "Technician",
    entityId: id,
    detail: { fields: Object.keys(data) },
  });
  return ok({ technician });
}
