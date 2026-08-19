import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, readBody, str } from "../../_lib/http";
import { jobType } from "../../_lib/rodlex";
import { applyJobPatch } from "./_update";

export const GET = handler(async (req: Request) => {
  await requireUser("ADMIN");
  const type = jobType(new URL(req.url).searchParams.get("type"));
  const rows = await db.jobPosting.findMany({
    where: type ? { type } : {},
    orderBy: [{ createdAt: "desc" }],
    include: {
      _count: { select: { applications: true } },
      applications: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  const jobs = rows.map(({ _count, ...j }) => ({
    ...j,
    applicationCount: _count.applications,
  }));
  return ok({ jobs, total: jobs.length });
});

export const POST = handler(async (req: Request) => {
  const admin = await requireUser("ADMIN");
  const b = await readBody<Record<string, unknown>>(req);
  const title = str(b.title);
  const description = str(b.description);
  const type = jobType(b.type);
  if (!title) return fail("กรุณากรอกชื่อตำแหน่งงาน");
  if (!type)
    return fail("ประเภทงานไม่ถูกต้อง (TECHNICIAN_FREELANCE/SHOP_PARTNER/STAFF)");
  if (!description) return fail("กรุณากรอกรายละเอียดงาน");

  const job = await db.jobPosting.create({
    data: {
      title,
      type,
      location: str(b.location) ?? null,
      wage: str(b.wage) ?? null,
      description,
      active: b.active === undefined ? true : b.active === true,
    },
  });
  await audit(db, {
    userId: admin.id,
    action: "JOB_CREATE",
    entity: "JobPosting",
    entityId: job.id,
    detail: { title },
  });
  return ok({ job }, { status: 201 });
});

/** PATCH ที่ collection (ส่ง id มาใน body) ตามที่ระบุใน CONTRACT2 */
export const PATCH = handler(async (req: Request) => {
  const admin = await requireUser("ADMIN");
  const b = await readBody<Record<string, unknown>>(req);
  const id = str(b.id);
  if (!id) return fail("กรุณาระบุ id ของตำแหน่งงาน");
  return applyJobPatch(admin.id, id, b);
});
