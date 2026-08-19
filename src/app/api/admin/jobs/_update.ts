// ตรรกะแก้ไขตำแหน่งงานที่ใช้ร่วมกันระหว่าง PATCH /api/admin/jobs (id ใน body)
// และ PATCH /api/admin/jobs/[id] — ไม่ใช่ route
import type { Prisma } from "@prisma/client";
import { ok, fail } from "@/lib/api";
import { db } from "@/lib/db";
import { audit, bool, str } from "../../_lib/http";
import { jobType } from "../../_lib/rodlex";

export async function applyJobPatch(
  adminId: string,
  id: string,
  b: Record<string, unknown>,
): Promise<Response> {
  const current = await db.jobPosting.findUnique({ where: { id } });
  if (!current) return fail("ไม่พบตำแหน่งงานนี้", 404);

  const data: Prisma.JobPostingUpdateInput = {};
  const title = str(b.title);
  if (title) data.title = title;
  const type = jobType(b.type);
  if (type) data.type = type;
  if (b.location !== undefined) data.location = str(b.location) ?? null;
  if (b.wage !== undefined) data.wage = str(b.wage) ?? null;
  const description = str(b.description);
  if (description) data.description = description;
  const active = bool(b.active);
  if (active !== undefined) data.active = active;

  if (!Object.keys(data).length) return fail("ไม่มีข้อมูลที่ต้องแก้ไข");

  const job = await db.jobPosting.update({ where: { id }, data });
  await audit(db, {
    userId: adminId,
    action: "JOB_UPDATE",
    entity: "JobPosting",
    entityId: id,
    detail: { fields: Object.keys(data) },
  });
  return ok({ job });
}
