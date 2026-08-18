import { handler, ok, fail } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit, int, readBody, str } from "../../_lib/http";

export const GET = handler(async () => {
  await requireUser("ADMIN");
  const banners = await db.banner.findMany({ orderBy: [{ sort: "asc" }] });
  return ok({ banners });
});

export const POST = handler(async (req: Request) => {
  const admin = await requireUser("ADMIN");
  const b = await readBody<Record<string, unknown>>(req);
  const title = str(b.title);
  if (!title) return fail("กรุณากรอกหัวข้อแบนเนอร์");

  const banner = await db.banner.create({
    data: {
      title,
      subtitle: str(b.subtitle) ?? null,
      ctaText: str(b.ctaText) ?? null,
      ctaHref: str(b.ctaHref) ?? null,
      active: b.active === undefined ? true : b.active === true,
      sort: int(b.sort, 0) ?? 0,
    },
  });
  await audit(db, {
    userId: admin.id,
    action: "BANNER_CREATE",
    entity: "Banner",
    entityId: banner.id,
    detail: { title },
  });
  return ok({ banner }, { status: 201 });
});
