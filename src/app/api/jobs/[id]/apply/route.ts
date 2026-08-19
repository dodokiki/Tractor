import { handler, ok, fail } from "@/lib/api";
import { db } from "@/lib/db";
import { readBody, str } from "../../../_lib/http";

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const job = await db.jobPosting.findUnique({ where: { id } });
    if (!job) return fail("ไม่พบตำแหน่งงานนี้", 404);
    if (!job.active) return fail("ตำแหน่งงานนี้ปิดรับสมัครแล้ว");

    const b = await readBody<Record<string, unknown>>(req);
    const name = str(b.name);
    const phone = str(b.phone);
    if (!name) return fail("กรุณากรอกชื่อ-นามสกุล");
    if (!phone || !/^0\d{8,9}$/.test(phone.replace(/[-\s]/g, "")))
      return fail("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");

    const application = await db.jobApplication.create({
      data: {
        jobId: id,
        name,
        phone: phone.replace(/[-\s]/g, ""),
        note: str(b.note) ?? null,
      },
    });

    return ok(
      {
        application: {
          id: application.id,
          jobId: application.jobId,
          jobTitle: job.title,
          name: application.name,
          createdAt: application.createdAt,
        },
      },
      { status: 201 },
    );
  },
);
